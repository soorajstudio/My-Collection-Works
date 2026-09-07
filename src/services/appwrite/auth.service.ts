import { ID, Query, Permission, Role } from 'appwrite';
import { account, databases, APPWRITE_CONFIG } from './client';
import { UserProfile } from '../../types/user.types';

export const liveAuthService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const user = await account.get();
      if (!user) return null;

      // Fetch user profile from database
      try {
        const response = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.profiles,
          [Query.equal('userId', user.$id), Query.limit(1)]
        );

        if (response.documents.length > 0) {
          const doc = response.documents[0];
          return {
            userId: doc.userId,
            username: doc.username,
            email: doc.email,
            displayName: doc.displayName || user.name,
            avatarUrl: doc.avatarUrl,
            avatarKey: doc.avatarKey,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
          };
        }
      } catch {
        // Fallback to basic account info if profile doc not created yet
      }

      return {
        userId: user.$id,
        username: user.name || user.email.split('@')[0],
        email: user.email,
        displayName: user.name,
        createdAt: user.$createdAt,
      };
    } catch {
      return null;
    }
  },

  async login(identifier: string, password: string): Promise<UserProfile> {
    let emailToUse = identifier.trim();

    // If identifier is a username rather than an email, resolve email via user_profiles
    const isEmail = /\S+@\S+\.\S+/.test(identifier);
    if (!isEmail) {
      try {
        const profileDocs = await databases.listDocuments(
          APPWRITE_CONFIG.databaseId,
          APPWRITE_CONFIG.collections.profiles,
          [Query.equal('username', identifier.toLowerCase().trim()), Query.limit(1)]
        );

        if (profileDocs.documents.length === 0) {
          throw new Error('Account with this username does not exist.');
        }
        emailToUse = profileDocs.documents[0].email;
      } catch (err: any) {
        throw new Error(err.message || 'Failed to resolve username.');
      }
    }

    // Clear any previous active session so Appwrite allows creating the new session
    try {
      await account.deleteSession('current');
    } catch {
      // Ignored if no session was active
    }

    // Create session in Appwrite
    await account.createEmailPasswordSession(emailToUse, password);
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Failed to retrieve user after login.');
    return user;
  },

  async register(data: { email: string; username: string; password: string }): Promise<UserProfile> {
    const cleanUsername = data.username.toLowerCase().trim();
    const cleanEmail = data.email.toLowerCase().trim();

    // Check username uniqueness
    try {
      const existing = await databases.listDocuments(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        [Query.equal('username', cleanUsername), Query.limit(1)]
      );
      if (existing.documents.length > 0) {
        throw new Error('Username is already taken. Please choose another.');
      }
    } catch (err: any) {
      if (err.message?.includes('already taken')) throw err;
    }

    // Clear any previous active session before creating the new account and session
    try {
      await account.deleteSession('current');
    } catch {
      // Ignored if no session was active
    }

    // Create Appwrite Auth account
    const newUserId = ID.unique();
    await account.create(newUserId, cleanEmail, data.password, cleanUsername);

    // Create session
    await account.createEmailPasswordSession(cleanEmail, data.password);

    // Create user profile record in database
    const profileDoc = await databases.createDocument(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      ID.unique(),
      {
        userId: newUserId,
        username: cleanUsername,
        email: cleanEmail,
        displayName: cleanUsername,
      },
      [
        Permission.read(Role.any()),
        Permission.update(Role.user(newUserId)),
        Permission.delete(Role.user(newUserId)),
      ]
    );

    return {
      userId: profileDoc.userId,
      username: profileDoc.username,
      email: profileDoc.email,
      displayName: profileDoc.displayName,
      createdAt: profileDoc.$createdAt,
    };
  },

  async logout(): Promise<void> {
    try {
      await account.deleteSession('current');
    } catch {
      // Ignored if session already gone
    }
  },

  async forgotPassword(email: string): Promise<void> {
    const redirectUrl = `${window.location.origin}/reset-password`;
    await account.createRecovery(email, redirectUrl);
  },

  async resetPassword(userId: string, secret: string, newPass: string): Promise<void> {
    await account.updateRecovery(userId, secret, newPass);
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current) throw new Error('Not authenticated');

    const profileDocs = await databases.listDocuments(
      APPWRITE_CONFIG.databaseId,
      APPWRITE_CONFIG.collections.profiles,
      [Query.equal('userId', current.userId), Query.limit(1)]
    );

    if (profileDocs.documents.length > 0) {
      const docId = profileDocs.documents[0].$id;
      const updatedDoc = await databases.updateDocument(
        APPWRITE_CONFIG.databaseId,
        APPWRITE_CONFIG.collections.profiles,
        docId,
        {
          displayName: updates.displayName ?? current.displayName,
          avatarUrl: updates.avatarUrl ?? current.avatarUrl,
          avatarKey: updates.avatarKey ?? current.avatarKey,
          updatedAt: new Date().toISOString(),
        }
      );

      return {
        userId: updatedDoc.userId,
        username: updatedDoc.username,
        email: updatedDoc.email,
        displayName: updatedDoc.displayName,
        avatarUrl: updatedDoc.avatarUrl,
        avatarKey: updatedDoc.avatarKey,
        createdAt: updatedDoc.createdAt,
        updatedAt: updatedDoc.updatedAt,
      };
    }

    return current;
  },
};

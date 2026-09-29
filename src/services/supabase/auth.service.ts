import { supabase } from './client';
import { UserProfile } from '../../types/user.types';

export const supabaseAuthService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        const cached = localStorage.getItem('supabase_user_profile');
        if (cached) {
          try { return JSON.parse(cached); } catch {}
        }
        return null;
      }

      const user = session.user;
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        const mapped: UserProfile = {
          userId: profile.user_id,
          username: profile.username,
          email: profile.email,
          displayName: profile.display_name || user.user_metadata?.display_name || profile.username,
          avatarUrl: profile.avatar_url,
          avatarKey: profile.avatar_key,
          createdAt: profile.created_at,
          updatedAt: profile.updated_at,
        };
        localStorage.setItem('supabase_user_profile', JSON.stringify(mapped));
        return mapped;
      }

      return {
        userId: user.id,
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
        email: user.email || '',
        displayName: user.user_metadata?.display_name || user.email?.split('@')[0],
        createdAt: user.created_at,
      };
    } catch {
      return null;
    }
  },

  async login(identifier: string, password: string): Promise<UserProfile> {
    let email = identifier.trim();

    if (!email.includes('@')) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('email, user_id, username, display_name, avatar_url')
        .ilike('username', identifier.trim())
        .maybeSingle();

      if (profile?.email) {
        email = profile.email;
      }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Check seeded/local user_profiles if auth hasn't been signed up yet
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .ilike('username', identifier.trim())
        .maybeSingle();

      if (profile) {
        const mapped: UserProfile = {
          userId: profile.user_id,
          username: profile.username,
          email: profile.email,
          displayName: profile.display_name || profile.username,
          avatarUrl: profile.avatar_url,
          createdAt: profile.created_at,
        };
        localStorage.setItem('supabase_user_profile', JSON.stringify(mapped));
        return mapped;
      }

      throw new Error(error.message);
    }

    const current = await this.getCurrentUser();
    if (!current) throw new Error('Failed to retrieve user after login.');
    return current;
  },

  async register(
    dataOrEmail: { email: string; username: string; password: string; displayName?: string } | string,
    passwordArg?: string,
    usernameArg?: string,
    displayNameArg?: string
  ): Promise<UserProfile> {
    let email: string;
    let password: string;
    let username: string;
    let displayName: string;

    if (typeof dataOrEmail === 'object') {
      email = dataOrEmail.email;
      password = dataOrEmail.password;
      username = dataOrEmail.username;
      displayName = dataOrEmail.displayName || dataOrEmail.username;
    } else {
      email = dataOrEmail;
      password = passwordArg || '';
      username = usernameArg || '';
      displayName = displayNameArg || usernameArg || '';
    }

    const cleanUsername = username.toLowerCase().trim();
    const cleanEmail = email.toLowerCase().trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          username: cleanUsername,
          display_name: displayName,
        },
      },
    });

    if (error) throw new Error(error.message);
    const userId = data.user?.id || `user_${Date.now()}`;

    const newProfile: UserProfile = {
      userId,
      username: cleanUsername,
      email: cleanEmail,
      displayName,
      createdAt: new Date().toISOString(),
    };

    await supabase.from('user_profiles').upsert({
      user_id: userId,
      username: newProfile.username,
      email: newProfile.email,
      display_name: newProfile.displayName,
    });

    localStorage.setItem('supabase_user_profile', JSON.stringify(newProfile));
    return newProfile;
  },

  async logout(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch {}
    localStorage.removeItem('supabase_user_profile');
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getCurrentUser();
    if (!current) throw new Error('Not authenticated.');

    const updated = { ...current, ...updates, updatedAt: new Date().toISOString() };
    await supabase.from('user_profiles').upsert({
      user_id: current.userId,
      username: updated.username,
      email: updated.email,
      display_name: updated.displayName,
      avatar_url: updated.avatarUrl,
      avatar_key: updated.avatarKey,
      updated_at: updated.updatedAt,
    });

    localStorage.setItem('supabase_user_profile', JSON.stringify(updated));
    return updated;
  },
};

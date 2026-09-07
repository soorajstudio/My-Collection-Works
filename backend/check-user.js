import { Client, Users, Databases, ID, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6a9e9053003be1fde2dc')
  .setKey('standard_43e6b28309162e22b7852c13ae50aed42bdbebe22c896b326e22961cd949b481cb385bf780b6eb18f9d1556d2678d6b6ba0b8eec0e973118d77908001e8660c562008557099c026f75d137b5f90773766f37b95baf23f1f829e82ab8d1bb51fb2c7c110f54bb07fa111784feaa4d58522aa719fb2e4d61f71fa1be4e2dd0a01e');

const users = new Users(client);
const databases = new Databases(client);

async function check() {
  const list = await users.list();
  console.log('Appwrite Users found:', list.total);
  for (const u of list.users) {
    console.log(`User: ${u.name} | ${u.email} | ${u.$id}`);
    // Check if profile exists in user_profiles
    try {
      const profile = await databases.getDocument('my_library_db', 'user_profiles', u.$id);
      console.log('  Profile document exists:', profile.username);
    } catch (err) {
      console.log('  Profile document missing. Creating it now...');
      try {
        await databases.createDocument(
          'my_library_db',
          'user_profiles',
          u.$id,
          {
            userId: u.$id,
            username: u.name || u.email.split('@')[0],
            email: u.email,
            displayName: u.name || 'Sooraj',
          },
          [
            Permission.read(Role.any()),
            Permission.update(Role.user(u.$id)),
            Permission.delete(Role.user(u.$id)),
          ]
        );
        console.log('  ✅ Profile document created successfully for', u.email);
      } catch (createErr) {
        console.error('  Error creating profile document:', createErr.message);
      }
    }
  }
}

check().catch(console.error);

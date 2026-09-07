import { Client, Storage, Permission, Role } from 'node-appwrite';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6a9e9053003be1fde2dc')
  .setKey('standard_43e6b28309162e22b7852c13ae50aed42bdbebe22c896b326e22961cd949b481cb385bf780b6eb18f9d1556d2678d6b6ba0b8eec0e973118d77908001e8660c562008557099c026f75d137b5f90773766f37b95baf23f1f829e82ab8d1bb51fb2c7c110f54bb07fa111784feaa4d58522aa719fb2e4d61f71fa1be4e2dd0a01e');

const storage = new Storage(client);

async function createBucket() {
  const bucketId = 'vault_files';
  try {
    const bucket = await storage.createBucket(
      bucketId,
      'Vault Files',
      [
        Permission.read(Role.any()),
        Permission.create(Role.any()),
        Permission.update(Role.any()),
        Permission.delete(Role.any()),
      ],
      false, // fileSecurity
      true,  // enabled
      undefined, // maxFileSize
      ['jpg', 'jpeg', 'png', 'webp', 'svg', 'pdf', 'apk', 'mp4'], // allowedFileExtensions
      undefined, // compression
      true,  // encryption
      true   // antivirus
    );
    console.log('✅ Storage bucket created:', bucket.$id);
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️ Bucket "vault_files" already exists.');
    } else {
      console.error('Error creating bucket:', err.message);
    }
  }
}

createBucket().catch(console.error);

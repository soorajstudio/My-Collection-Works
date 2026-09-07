import { Client, Databases, Permission, Role } from 'node-appwrite';

/**
 * Automated Appwrite Database Schema Provisioner
 * Usage:
 *   APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1" \
 *   APPWRITE_PROJECT_ID="your_project_id" \
 *   APPWRITE_API_KEY="your_admin_secret_key" \
 *   node backend/setup-appwrite-db.js
 */

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'my_library_db';

async function init() {
  console.log('🚀 Starting Appwrite Database Provisioning for "My Library"...');

  // 1. Create Database if not exists
  try {
    await databases.create(DATABASE_ID, 'My Library Database');
    console.log(`✅ Database "${DATABASE_ID}" created.`);
  } catch (err) {
    if (err.code === 409) {
      console.log(`ℹ️ Database "${DATABASE_ID}" already exists.`);
    } else {
      console.error('Error creating database:', err.message);
    }
  }

  // Helper to create collection with document-level permissions
  async function createCollection(id, name) {
    try {
      await databases.createCollection(
        DATABASE_ID,
        id,
        name,
        [Permission.create(Role.users())], // Only authenticated users can insert documents
        true // Document-level security enabled
      );
      console.log(`✅ Collection "${name}" (${id}) created with Document-Level Security.`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`ℹ️ Collection "${name}" (${id}) already exists.`);
      } else {
        console.error(`Error creating collection ${name}:`, err.message);
      }
    }
  }

  // Safe attribute creator helper
  async function createAttr(colId, type, key, options = {}) {
    try {
      if (type === 'string') {
        await databases.createStringAttribute(DATABASE_ID, colId, key, options.size || 255, options.required || false, options.default || undefined, options.array || false);
      } else if (type === 'integer') {
        await databases.createIntegerAttribute(DATABASE_ID, colId, key, options.required || false, options.min || undefined, options.max || undefined, options.default || undefined, options.array || false);
      } else if (type === 'boolean') {
        await databases.createBooleanAttribute(DATABASE_ID, colId, key, options.required || false, options.default !== undefined ? options.default : false, options.array || false);
      } else if (type === 'datetime') {
        await databases.createDatetimeAttribute(DATABASE_ID, colId, key, options.required || false, options.default || undefined, options.array || false);
      }
      console.log(`  + [${colId}] Added attribute: ${key} (${type})`);
    } catch (err) {
      if (err.code !== 409) {
        console.warn(`  ! [${colId}] Note for ${key}:`, err.message);
      }
    }
  }

  // 2. Create Collections
  await createCollection('user_profiles', 'User Profiles');
  await createCollection('books', 'Books');
  await createCollection('reading_states', 'Reading States');
  await createCollection('certificates', 'Certificates');
  await createCollection('projects', 'Projects');

  console.log('\n📦 Provisioning Collection Attributes...');

  // User Profiles Attributes
  await createAttr('user_profiles', 'string', 'userId', { size: 64, required: true });
  await createAttr('user_profiles', 'string', 'username', { size: 64, required: true });
  await createAttr('user_profiles', 'string', 'email', { size: 255, required: true });
  await createAttr('user_profiles', 'string', 'displayName', { size: 128 });
  await createAttr('user_profiles', 'string', 'avatarUrl', { size: 2048 });
  await createAttr('user_profiles', 'string', 'avatarKey', { size: 512 });

  // Books Attributes
  await createAttr('books', 'string', 'ownerId', { size: 64, required: true });
  await createAttr('books', 'string', 'title', { size: 255, required: true });
  await createAttr('books', 'string', 'author', { size: 255, required: true });
  await createAttr('books', 'string', 'description', { size: 5000 });
  await createAttr('books', 'string', 'category', { size: 64, required: true });
  await createAttr('books', 'string', 'language', { size: 64, required: true });
  await createAttr('books', 'string', 'coverFileUrl', { size: 2048 });
  await createAttr('books', 'string', 'coverFileKey', { size: 512 });
  await createAttr('books', 'string', 'coverImagePosition', { size: 64, default: 'center' });
  await createAttr('books', 'string', 'pdfFileUrl', { size: 2048 });
  await createAttr('books', 'string', 'pdfFileKey', { size: 512 });
  await createAttr('books', 'string', 'pdfFileName', { size: 255 });
  await createAttr('books', 'integer', 'totalPages');
  await createAttr('books', 'integer', 'totalChapters');

  // Reading States Attributes
  await createAttr('reading_states', 'string', 'userId', { size: 64, required: true });
  await createAttr('reading_states', 'string', 'bookId', { size: 64, required: true });
  await createAttr('reading_states', 'string', 'status', { size: 32, required: true });
  await createAttr('reading_states', 'integer', 'currentChapter');
  await createAttr('reading_states', 'integer', 'currentPage');
  await createAttr('reading_states', 'integer', 'progressPercentage');
  await createAttr('reading_states', 'boolean', 'wishlist', { default: false });
  await createAttr('reading_states', 'datetime', 'lastReadAt');

  // Certificates Attributes
  await createAttr('certificates', 'string', 'ownerId', { size: 64, required: true });
  await createAttr('certificates', 'string', 'title', { size: 255, required: true });
  await createAttr('certificates', 'string', 'issuer', { size: 255, required: true });
  await createAttr('certificates', 'string', 'issueDate', { size: 32, required: true });
  await createAttr('certificates', 'string', 'expiryDate', { size: 32 });
  await createAttr('certificates', 'boolean', 'hasNoExpiry', { default: false });
  await createAttr('certificates', 'string', 'credentialId', { size: 255 });
  await createAttr('certificates', 'string', 'verificationUrl', { size: 2048 });
  await createAttr('certificates', 'string', 'skills', { size: 64, array: true });
  await createAttr('certificates', 'string', 'fileUrl', { size: 2048 });
  await createAttr('certificates', 'string', 'fileKey', { size: 512 });
  await createAttr('certificates', 'string', 'fileType', { size: 16 });
  await createAttr('certificates', 'string', 'fileName', { size: 255 });

  // Projects Attributes
  await createAttr('projects', 'string', 'ownerId', { size: 64, required: true });
  await createAttr('projects', 'string', 'title', { size: 255, required: true });
  await createAttr('projects', 'string', 'tagline', { size: 500 });
  await createAttr('projects', 'string', 'description', { size: 5000 });
  await createAttr('projects', 'string', 'status', { size: 32, required: true });
  await createAttr('projects', 'string', 'technologies', { size: 64, array: true });
  await createAttr('projects', 'string', 'githubUrl', { size: 2048 });
  await createAttr('projects', 'string', 'liveDemoUrl', { size: 2048 });
  await createAttr('projects', 'string', 'iconUrl', { size: 2048 });
  await createAttr('projects', 'string', 'iconKey', { size: 512 });
  await createAttr('projects', 'string', 'apkUrl', { size: 2048 });
  await createAttr('projects', 'string', 'apkKey', { size: 512 });
  await createAttr('projects', 'string', 'apkFileName', { size: 255 });
  await createAttr('projects', 'integer', 'apkSize');
  await createAttr('projects', 'string', 'apkVersion', { size: 32 });
  await createAttr('projects', 'string', 'screenshots', { size: 2048, array: true });

  console.log('\n🎉 Appwrite Database Schema, Collections, and Document-Level Permissions Successfully Initialized!');
}

init().catch(console.error);

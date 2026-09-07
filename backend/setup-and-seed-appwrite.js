import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import {
  INITIAL_MOCK_BOOKS,
  INITIAL_MOCK_PROJECTS,
  INITIAL_MOCK_CERTIFICATES,
  INITIAL_MOCK_USER,
} from '../src/services/mock/mockData.js';

const client = new Client()
  .setEndpoint('https://cloud.appwrite.io/v1')
  .setProject('6a9e9053003be1fde2dc')
  .setKey('standard_43e6b28309162e22b7852c13ae50aed42bdbebe22c896b326e22961cd949b481cb385bf780b6eb18f9d1556d2678d6b6ba0b8eec0e973118d77908001e8660c562008557099c026f75d137b5f90773766f37b95baf23f1f829e82ab8d1bb51fb2c7c110f54bb07fa111784feaa4d58522aa719fb2e4d61f71fa1be4e2dd0a01e');

const databases = new Databases(client);
const DATABASE_ID = 'my_library_db';

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  console.log('🚀 Connecting to Appwrite Project 6a9e9053003be1fde2dc...');

  // 1. Create or verify database
  try {
    await databases.create(DATABASE_ID, 'My Library Database');
    console.log('✅ Database "my_library_db" created successfully!');
  } catch (err) {
    if (err.code === 409) {
      console.log('ℹ️ Database "my_library_db" already exists.');
    } else {
      console.error('Error creating database:', err.message);
      throw err;
    }
  }

  // 2. Helper to create collection
  async function createCol(id, name) {
    try {
      await databases.createCollection(
        DATABASE_ID,
        id,
        name,
        [
          Permission.read(Role.any()),
          Permission.create(Role.users()),
          Permission.update(Role.users()),
          Permission.delete(Role.users()),
        ],
        true // Document-level security
      );
      console.log(`✅ Collection "${name}" (${id}) created.`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`ℹ️ Collection "${name}" (${id}) exists.`);
      } else {
        console.error(`Collection ${id} error:`, err.message);
      }
    }
  }

  await createCol('user_profiles', 'User Profiles');
  await createCol('books', 'Books');
  await createCol('reading_states', 'Reading States');
  await createCol('certificates', 'Certificates');
  await createCol('projects', 'Projects');

  // 3. Helper to create attributes safely
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
      console.log(`  + [${colId}] Created attribute: ${key} (${type})`);
    } catch (err) {
      if (err.code !== 409) {
        console.warn(`  ! [${colId}] ${key}:`, err.message);
      }
    }
  }

  console.log('\n📦 Creating attributes for all collections...');

  // user_profiles
  await createAttr('user_profiles', 'string', 'userId', { size: 64, required: true });
  await createAttr('user_profiles', 'string', 'username', { size: 64, required: true });
  await createAttr('user_profiles', 'string', 'email', { size: 255, required: true });
  await createAttr('user_profiles', 'string', 'displayName', { size: 128 });
  await createAttr('user_profiles', 'string', 'avatarUrl', { size: 2048 });
  await createAttr('user_profiles', 'string', 'avatarKey', { size: 512 });

  // books
  await createAttr('books', 'string', 'ownerId', { size: 64, required: true });
  await createAttr('books', 'string', 'title', { size: 255, required: true });
  await createAttr('books', 'string', 'author', { size: 255, required: true });
  await createAttr('books', 'string', 'description', { size: 5000 });
  await createAttr('books', 'string', 'category', { size: 64, required: true });
  await createAttr('books', 'string', 'language', { size: 64, required: true });
  await createAttr('books', 'string', 'coverFileUrl', { size: 2048 });
  await createAttr('books', 'string', 'coverFileKey', { size: 512 });
  await createAttr('books', 'string', 'pdfFileUrl', { size: 2048 });
  await createAttr('books', 'string', 'pdfFileKey', { size: 512 });
  await createAttr('books', 'string', 'pdfFileName', { size: 255 });
  await createAttr('books', 'integer', 'totalPages');
  await createAttr('books', 'integer', 'totalChapters');

  // reading_states
  await createAttr('reading_states', 'string', 'userId', { size: 64, required: true });
  await createAttr('reading_states', 'string', 'bookId', { size: 64, required: true });
  await createAttr('reading_states', 'string', 'status', { size: 32, required: true });
  await createAttr('reading_states', 'integer', 'currentChapter');
  await createAttr('reading_states', 'integer', 'currentPage');
  await createAttr('reading_states', 'integer', 'progressPercentage');
  await createAttr('reading_states', 'boolean', 'wishlist', { default: false });
  await createAttr('reading_states', 'datetime', 'lastReadAt');

  // certificates
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

  // projects
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

  console.log('\n⏳ Waiting 5 seconds for Appwrite attribute indexes to finish building...');
  await sleep(5000);

  // 4. Seed Initial Data
  console.log('\n🌱 Seeding initial documents into Appwrite...');

  // Books
  for (const b of INITIAL_MOCK_BOOKS) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'books',
        b.id,
        {
          ownerId: b.ownerId,
          title: b.title,
          author: b.author,
          description: b.description || '',
          category: b.category,
          language: b.language,
          coverFileUrl: b.coverFileUrl || '',
          totalPages: b.totalPages ?? null,
          totalChapters: b.totalChapters ?? null,
        },
        [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
      );
      console.log(`  + Book seeded: ${b.title}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ℹ️ Book "${b.title}" already seeded.`);
      } else {
        console.warn(`  ! Book "${b.title}" seed note:`, err.message);
      }
    }

    // Reading State
    if (b.readingState) {
      try {
        await databases.createDocument(
          DATABASE_ID,
          'reading_states',
          b.readingState.id,
          {
            userId: b.readingState.userId,
            bookId: b.id,
            status: b.readingState.status,
            currentChapter: b.readingState.currentChapter ?? null,
            currentPage: b.readingState.currentPage ?? null,
            progressPercentage: b.readingState.progressPercentage ?? 0,
            wishlist: b.readingState.wishlist ?? false,
          },
          [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
        );
      } catch (err) {
        if (err.code !== 409) {
          console.warn(`  ! ReadingState for "${b.title}":`, err.message);
        }
      }
    }
  }

  // Projects
  for (const p of INITIAL_MOCK_PROJECTS) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'projects',
        p.id,
        {
          ownerId: p.ownerId,
          title: p.title,
          tagline: p.tagline || '',
          description: p.description || '',
          status: p.status,
          technologies: p.technologies || [],
          githubUrl: p.githubUrl || '',
          liveDemoUrl: p.liveDemoUrl || '',
          iconUrl: p.iconUrl || '',
        },
        [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
      );
      console.log(`  + Project seeded: ${p.title}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ℹ️ Project "${p.title}" already seeded.`);
      } else {
        console.warn(`  ! Project "${p.title}" seed note:`, err.message);
      }
    }
  }

  // Certificates
  for (const c of INITIAL_MOCK_CERTIFICATES) {
    try {
      await databases.createDocument(
        DATABASE_ID,
        'certificates',
        c.id,
        {
          ownerId: c.ownerId,
          title: c.title,
          issuer: c.issuer,
          issueDate: c.issueDate,
          expiryDate: c.expiryDate || null,
          hasNoExpiry: c.hasNoExpiry ?? false,
          credentialId: c.credentialId || '',
          verificationUrl: c.verificationUrl || '',
          skills: c.skills || [],
          fileUrl: c.fileUrl || '',
        },
        [Permission.read(Role.any()), Permission.update(Role.any()), Permission.delete(Role.any())]
      );
      console.log(`  + Certificate seeded: ${c.title}`);
    } catch (err) {
      if (err.code === 409) {
        console.log(`  ℹ️ Certificate "${c.title}" already seeded.`);
      } else {
        console.warn(`  ! Certificate "${c.title}" seed note:`, err.message);
      }
    }
  }

  console.log('\n🎉 ALL DONE! Appwrite Database and Collections are 100% live with your data!');
}

run().catch((e) => {
  console.error('FATAL SETUP ERROR:', e);
  process.exit(1);
});

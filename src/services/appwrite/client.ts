import { Client, Account, Databases, Storage } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a9e9053003be1fde2dc';

export const appwriteClient = new Client();

if (endpoint && projectId) {
  appwriteClient.setEndpoint(endpoint).setProject(projectId);
}

export const account = new Account(appwriteClient);
export const databases = new Databases(appwriteClient);
export const storage = new Storage(appwriteClient);

export const APPWRITE_CONFIG = {
  databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID || 'my_library_db',
  collections: {
    profiles: import.meta.env.VITE_APPWRITE_COLLECTION_PROFILES || 'user_profiles',
    books: import.meta.env.VITE_APPWRITE_COLLECTION_BOOKS || 'books',
    readingStates: import.meta.env.VITE_APPWRITE_COLLECTION_READING_STATES || 'reading_states',
    certificates: import.meta.env.VITE_APPWRITE_COLLECTION_CERTIFICATES || 'certificates',
    projects: import.meta.env.VITE_APPWRITE_COLLECTION_PROJECTS || 'projects',
  },
  r2SignerEndpoint: import.meta.env.VITE_R2_SIGNER_ENDPOINT || '',
  r2PublicUrl: import.meta.env.VITE_R2_PUBLIC_URL || '',
  isMock: import.meta.env.VITE_USE_MOCK_FALLBACK === 'true',
};

import { APPWRITE_CONFIG, storage } from '../appwrite/client';
import { ID } from 'appwrite';

export interface UploadOptions {
  category: 'books/covers' | 'books/pdfs' | 'certificates/images' | 'certificates/pdfs' | 'projects/icons' | 'projects/screenshots' | 'projects/apks' | 'projects/videos';
  onProgress?: (percent: number) => void;
}

export interface UploadResult {
  fileKey: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
}

const ALLOWED_TYPES: Record<string, { mimes: string[]; maxBytes: number; exts: string[] }> = {
  'books/covers': {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 5 * 1024 * 1024,
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  'books/pdfs': {
    mimes: ['application/pdf'],
    maxBytes: 50 * 1024 * 1024,
    exts: ['.pdf'],
  },
  'certificates/images': {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 10 * 1024 * 1024,
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  'certificates/pdfs': {
    mimes: ['application/pdf'],
    maxBytes: 25 * 1024 * 1024,
    exts: ['.pdf'],
  },
  'projects/icons': {
    mimes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
    maxBytes: 2 * 1024 * 1024,
    exts: ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
  },
  'projects/screenshots': {
    mimes: ['image/jpeg', 'image/png', 'image/webp'],
    maxBytes: 10 * 1024 * 1024,
    exts: ['.jpg', '.jpeg', '.png', '.webp'],
  },
  'projects/apks': {
    mimes: ['application/vnd.android.package-archive', 'application/octet-stream'],
    maxBytes: 150 * 1024 * 1024,
    exts: ['.apk'],
  },
  'projects/videos': {
    mimes: ['video/mp4', 'video/webm'],
    maxBytes: 200 * 1024 * 1024,
    exts: ['.mp4', '.webm'],
  },
};

export const r2StorageService = {
  validateFile(file: File, category: keyof typeof ALLOWED_TYPES): void {
    const rules = ALLOWED_TYPES[category];
    if (!rules) throw new Error(`Unknown upload category: ${category}`);

    if (file.size > rules.maxBytes) {
      const maxMb = (rules.maxBytes / (1024 * 1024)).toFixed(0);
      throw new Error(`File is too large. Maximum allowed size is ${maxMb} MB.`);
    }

    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    const hasValidExt = rules.exts.includes(ext);
    const hasValidMime = rules.mimes.includes(file.type);

    if (!hasValidExt && !hasValidMime) {
      throw new Error(`Invalid file type. Supported formats: ${rules.exts.join(', ')}`);
    }
  },

  async uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
    this.validateFile(file, options.category);

    // 1. If connected to live Appwrite without R2 signer, upload directly to Appwrite Storage bucket:
    if (!APPWRITE_CONFIG.isMock && !APPWRITE_CONFIG.r2SignerEndpoint) {
      try {
        const fileId = ID.unique();
        options.onProgress?.(30);
        const uploaded = await storage.createFile('vault_files', fileId, file);
        options.onProgress?.(80);

        const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
        const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a9e9053003be1fde2dc';
        const viewUrl = `${endpoint}/storage/buckets/vault_files/files/${uploaded.$id}/view?project=${projectId}`;

        options.onProgress?.(100);
        return {
          fileKey: `appwrite://${uploaded.$id}`,
          fileUrl: viewUrl,
          fileName: file.name,
          fileSize: file.size,
        };
      } catch (err: any) {
        console.error('Appwrite Storage upload failed:', err);
        throw new Error('Failed to upload file: ' + (err.message || 'Unknown error'));
      }
    }

    // 2. If in mock or standalone demo mode
    if (APPWRITE_CONFIG.isMock) {
      // Simulate realistic upload progress
      const totalSteps = 10;
      for (let i = 1; i <= totalSteps; i++) {
        await new Promise((r) => setTimeout(r, 40));
        options.onProgress?.(Math.round((i / totalSteps) * 100));
      }

      const generatedKey = `${options.category}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      // Convert images to Base64 Data URLs so they persist in localStorage across browser reloads
      const isImage = file.type.startsWith('image/');
      let fileUrl = '';
      if (isImage) {
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      } else {
        fileUrl = URL.createObjectURL(file);
      }

      return {
        fileKey: generatedKey,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    }

    // Live Cloudflare R2 Upload Flow via Presigned PUT URL
    options.onProgress?.(10);
    const presignedRes = await fetch(APPWRITE_CONFIG.r2SignerEndpoint + '/upload-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        fileType: file.type,
        category: options.category,
      }),
    });

    if (!presignedRes.ok) {
      throw new Error('Failed to request Cloudflare R2 presigned upload URL.');
    }

    const { uploadUrl, fileKey, publicUrl } = await presignedRes.json();

    // Direct upload to Cloudflare R2 with XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.round((e.loaded / e.total) * 100);
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            fileKey,
            fileUrl: publicUrl || `${APPWRITE_CONFIG.r2PublicUrl}/${fileKey}`,
            fileName: file.name,
            fileSize: file.size,
          });
        } else {
          reject(new Error(`Cloudflare R2 upload failed with status ${xhr.status}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error occurred during Cloudflare R2 upload.'));
      xhr.send(file);
    });
  },

  async getDownloadUrl(fileKey: string): Promise<string> {
    if (APPWRITE_CONFIG.isMock || !APPWRITE_CONFIG.r2SignerEndpoint) {
      return '';
    }
    const res = await fetch(`${APPWRITE_CONFIG.r2SignerEndpoint}/download-url?key=${encodeURIComponent(fileKey)}`);
    const data = await res.json();
    return data.url;
  },
};

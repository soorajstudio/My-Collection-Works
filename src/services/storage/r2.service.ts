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
    options.onProgress?.(0);

    // 1. If connected to live Appwrite without R2 signer, upload directly with real XMLHttpRequest progress:
    if (!APPWRITE_CONFIG.isMock && !APPWRITE_CONFIG.r2SignerEndpoint) {
      const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
      const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a9e9053003be1fde2dc';
      const fileId = ID.unique();

      const formData = new FormData();
      formData.append('fileId', fileId);
      formData.append('file', file);
      formData.append('permissions[]', 'read("any")');

      try {
        return await new Promise<UploadResult>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('POST', `${endpoint}/storage/buckets/vault_files/files`, true);
          xhr.setRequestHeader('X-Appwrite-Project', projectId);
          xhr.setRequestHeader('X-Appwrite-Response-Format', '1.0.0');
          xhr.withCredentials = true;

          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable && options.onProgress) {
              const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
              options.onProgress(percent);
            }
          };

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              options.onProgress?.(100);
              const uploaded = JSON.parse(xhr.responseText);
              const viewUrl = `${endpoint}/storage/buckets/vault_files/files/${uploaded.$id}/view?project=${projectId}`;
              resolve({
                fileKey: `appwrite://${uploaded.$id}`,
                fileUrl: viewUrl,
                fileName: file.name,
                fileSize: file.size,
              });
            } else {
              reject(new Error(`Upload failed (${xhr.status}): ${xhr.responseText}`));
            }
          };

          xhr.onerror = () => reject(new Error('Network error during file upload'));
          xhr.send(formData);
        });
      } catch {
        // Safe fallback using Appwrite SDK with dynamic smooth progress
        let currentProgress = 5;
        options.onProgress?.(currentProgress);
        const progressTimer = setInterval(() => {
          if (currentProgress < 90) {
            currentProgress += 5;
            options.onProgress?.(currentProgress);
          }
        }, 100);

        try {
          const uploaded = await storage.createFile('vault_files', fileId, file);
          clearInterval(progressTimer);
          options.onProgress?.(100);
          const viewUrl = `${endpoint}/storage/buckets/vault_files/files/${uploaded.$id}/view?project=${projectId}`;
          return {
            fileKey: `appwrite://${uploaded.$id}`,
            fileUrl: viewUrl,
            fileName: file.name,
            fileSize: file.size,
          };
        } catch (err: any) {
          clearInterval(progressTimer);
          throw new Error('Failed to upload file: ' + (err.message || 'Unknown error'));
        }
      }
    }

    // 2. If in mock or standalone demo mode
    if (APPWRITE_CONFIG.isMock) {
      options.onProgress?.(5);
      const isImage = file.type.startsWith('image/');
      let fileUrl = '';

      if (isImage) {
        fileUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              let { width, height } = img;
              const maxDim = 1000;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              const canvas = document.createElement('canvas');
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                try {
                  resolve(canvas.toDataURL('image/jpeg', 0.82));
                  return;
                } catch {}
              }
              resolve(e.target?.result as string || URL.createObjectURL(file));
            };
            img.onerror = () => resolve(URL.createObjectURL(file));
            img.src = e.target?.result as string;
          };
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      } else {
        fileUrl = URL.createObjectURL(file);
      }

      // Smooth, realistic upload percentage progression: 0% -> 100%
      const progressionSteps = [15, 32, 54, 75, 91, 100];
      for (const pct of progressionSteps) {
        await new Promise((r) => setTimeout(r, 45));
        options.onProgress?.(pct);
      }

      const generatedKey = `${options.category}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
      return {
        fileKey: generatedKey,
        fileUrl,
        fileName: file.name,
        fileSize: file.size,
      };
    }

    // 3. Live Cloudflare R2 Upload Flow via Presigned PUT URL
    options.onProgress?.(0);
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

    // Direct upload to Cloudflare R2 with XMLHttpRequest for real progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && options.onProgress) {
          const percent = Math.min(99, Math.round((e.loaded / e.total) * 100));
          options.onProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          options.onProgress?.(100);
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

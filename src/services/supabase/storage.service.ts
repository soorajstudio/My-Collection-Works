import { supabase } from './client';
import { UploadOptions, UploadResult } from '../storage/r2.service';

export const supabaseStorageService = {
  async uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
    options.onProgress?.(10);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${options.category}/${Date.now()}_${cleanName}`;

    options.onProgress?.(35);
    try {
      const { data, error } = await supabase.storage
        .from('vault_files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (!error && data?.path) {
        options.onProgress?.(80);
        const { data: urlData } = supabase.storage
          .from('vault_files')
          .getPublicUrl(data.path);

        options.onProgress?.(100);
        return {
          fileKey: data.path,
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          fileSize: file.size,
        };
      }

      console.warn('Supabase storage upload failed:', error?.message);

      // Resilient fallback for images: Convert to a permanent Base64 Data URL
      // so it is stored directly in PostgreSQL and NEVER disappears on page refresh or next day.
      if (file.type.startsWith('image/')) {
        options.onProgress?.(70);
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(new Error('Failed to read image data'));
          reader.readAsDataURL(file);
        });

        options.onProgress?.(100);
        return {
          fileKey: filePath,
          fileUrl: base64Url,
          fileName: file.name,
          fileSize: file.size,
        };
      }

      throw new Error(
        `Failed to upload file to storage (${error?.message || 'Permission denied'}). Please ensure storage policies are configured on 'vault_files'.`
      );
    } catch (err: any) {
      if (file.type.startsWith('image/')) {
        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = () => reject(err);
          reader.readAsDataURL(file);
        });
        options.onProgress?.(100);
        return {
          fileKey: filePath,
          fileUrl: base64Url,
          fileName: file.name,
          fileSize: file.size,
        };
      }
      throw err;
    }
  },

  async uploadDataUrl(dataUrl: string, fileName: string, options: UploadOptions): Promise<UploadResult> {
    try {
      const arr = dataUrl.split(',');
      const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
      const bstr = atob(arr[1]);
      let n = bstr.length;
      const u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      const file = new File([u8arr], fileName, { type: mime });
      return await this.uploadFile(file, options);
    } catch {
      return {
        fileKey: `${options.category}/${Date.now()}_${fileName}`,
        fileUrl: dataUrl,
        fileName,
        fileSize: dataUrl.length,
      };
    }
  },

  async getDownloadUrl(fileKey: string): Promise<string> {
    const { data } = supabase.storage.from('vault_files').getPublicUrl(fileKey);
    return data.publicUrl;
  },
};

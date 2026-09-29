import { supabase } from './client';
import { UploadOptions, UploadResult } from '../storage/r2.service';

export const supabaseStorageService = {
  async uploadFile(file: File, options: UploadOptions): Promise<UploadResult> {
    options.onProgress?.(10);
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${options.category}/${Date.now()}_${cleanName}`;

    options.onProgress?.(35);
    const { data, error } = await supabase.storage
      .from('vault_files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (error) {
      console.warn('Supabase storage upload error:', error.message);
      // Fallback: create object URL if bucket is not yet created
      options.onProgress?.(100);
      return {
        fileKey: filePath,
        fileUrl: URL.createObjectURL(file),
        fileName: file.name,
        fileSize: file.size,
      };
    }

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
  },

  async uploadDataUrl(dataUrl: string, fileName: string, options: UploadOptions): Promise<UploadResult> {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], fileName, { type: mime });
    return this.uploadFile(file, options);
  },

  async getDownloadUrl(fileKey: string): Promise<string> {
    const { data } = supabase.storage.from('vault_files').getPublicUrl(fileKey);
    return data.publicUrl;
  },
};

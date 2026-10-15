import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export interface UploadResult {
  url: string;
  key: string;
}

/** Upload a single image file; reports 0–100 progress via `onProgress`. */
export async function uploadImage(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<UploadResult> {
  const form = new FormData();
  form.append('file', file);
  const { data } = await apiClient.post<Envelope<UploadResult>>(
    '/uploads',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    },
  );
  return data.data;
}

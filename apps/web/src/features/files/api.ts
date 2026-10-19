import type {
  CreateFolder,
  FileDto,
  FolderContents,
  FolderDto,
  StorageUsage,
  UpdateFile,
  UpdateFolder,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export async function listFiles(folderId?: string, starred?: boolean): Promise<FolderContents> {
  const params: Record<string, string> = {};
  if (folderId) params.folderId = folderId;
  if (starred) params.starred = 'true';
  const { data } = await apiClient.get<Envelope<FolderContents>>('/files', { params });
  return data.data;
}

export async function getStorage(): Promise<StorageUsage> {
  const { data } = await apiClient.get<Envelope<StorageUsage>>('/files/storage');
  return data.data;
}

export async function createFolder(input: CreateFolder): Promise<FolderDto> {
  const { data } = await apiClient.post<Envelope<FolderDto>>('/files/folders', input);
  return data.data;
}

export async function updateFolder(id: string, input: UpdateFolder): Promise<FolderDto> {
  const { data } = await apiClient.patch<Envelope<FolderDto>>(`/files/folders/${id}`, input);
  return data.data;
}

export async function deleteFolder(id: string): Promise<void> {
  await apiClient.delete(`/files/folders/${id}`);
}

export async function uploadFiles(
  files: File[],
  folderId?: string,
  onProgress?: (percent: number) => void,
): Promise<FileDto[]> {
  const form = new FormData();
  for (const f of files) form.append('files', f);
  const { data } = await apiClient.post<Envelope<FileDto[]>>('/files/upload', form, {
    params: folderId ? { folderId } : undefined,
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });
  return data.data;
}

export async function updateFile(id: string, input: UpdateFile): Promise<FileDto> {
  const { data } = await apiClient.patch<Envelope<FileDto>>(`/files/${id}`, input);
  return data.data;
}

export async function deleteFile(id: string): Promise<void> {
  await apiClient.delete(`/files/${id}`);
}

export async function getDownloadUrl(id: string): Promise<{ url: string; name: string }> {
  const { data } = await apiClient.get<Envelope<{ url: string; name: string }>>(`/files/${id}/download`);
  return data.data;
}

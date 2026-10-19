// File Manager contracts shared between web and api.
import { z } from 'zod';

export const createFolderSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  parentId: z.string().trim().min(1).nullable().optional(),
  color: z.string().trim().max(20).optional(),
});
export type CreateFolder = z.infer<typeof createFolderSchema>;

export const updateFolderSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  parentId: z.string().trim().min(1).nullable().optional(),
  color: z.string().trim().max(20).optional(),
});
export type UpdateFolder = z.infer<typeof updateFolderSchema>;

export const updateFileSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  folderId: z.string().trim().min(1).nullable().optional(),
  isStarred: z.boolean().optional(),
});
export type UpdateFile = z.infer<typeof updateFileSchema>;

export const fileListQuerySchema = z.object({
  folderId: z.string().trim().min(1).optional(),
  starred: z.coerce.boolean().optional(),
});
export type FileListQuery = z.infer<typeof fileListQuerySchema>;

export interface FolderDto {
  id: string;
  owner: string;
  name: string;
  parent: string | null;
  color?: string;
  fileCount: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FileDto {
  id: string;
  owner: string;
  name: string;
  folder: string | null;
  size: number;
  mimeType: string;
  storageKey: string;
  url: string;
  sharedWith: string[];
  isStarred: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Breadcrumb {
  id: string;
  name: string;
}

export interface FolderContents {
  folders: FolderDto[];
  files: FileDto[];
  breadcrumbs: Breadcrumb[];
}

/** Rough file-kind buckets, used by the storage widget. */
export type StorageKind = 'images' | 'documents' | 'videos' | 'audio' | 'other';

export interface StorageUsage {
  used: number;
  total: number;
  byKind: Record<StorageKind, { size: number; count: number }>;
}

/** Map a MIME type to a coarse storage kind (shared so web + api agree). */
export function storageKindOf(mimeType: string): StorageKind {
  if (mimeType.startsWith('image/')) return 'images';
  if (mimeType.startsWith('video/')) return 'videos';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/pdf' ||
    mimeType.includes('word') ||
    mimeType.includes('sheet') ||
    mimeType.includes('excel') ||
    mimeType.includes('presentation') ||
    mimeType.includes('document')
  ) {
    return 'documents';
  }
  return 'other';
}

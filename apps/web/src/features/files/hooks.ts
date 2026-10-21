'use client';

import type { UpdateFile, UpdateFolder } from '@rocket/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createFolder,
  deleteFile,
  deleteFolder,
  getFile,
  getStorage,
  listFiles,
  updateFile,
  updateFolder,
  uploadFiles,
} from '@/features/files/api';

export const fileKeys = {
  all: ['files'] as const,
  list: (folderId?: string, starred?: boolean) => ['files', 'list', folderId ?? null, starred ?? false] as const,
  detail: (id: string) => ['files', 'detail', id] as const,
  storage: () => ['files', 'storage'] as const,
};

export function useFolderContents(folderId?: string, starred?: boolean) {
  return useQuery({
    queryKey: fileKeys.list(folderId, starred),
    queryFn: () => listFiles(folderId, starred),
  });
}

export function useFile(id: string) {
  return useQuery({
    queryKey: fileKeys.detail(id),
    queryFn: () => getFile(id),
    enabled: Boolean(id),
  });
}

export function useStorage() {
  return useQuery({ queryKey: fileKeys.storage(), queryFn: getStorage });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: fileKeys.all });
}

export function useCreateFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      invalidate();
      toast.success('Folder created');
    },
  });
}

export function useUpdateFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFolder }) => updateFolder(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteFolder() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      invalidate();
      toast.success('Folder deleted');
    },
  });
}

export function useUploadFiles() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      files,
      folderId,
      onProgress,
    }: {
      files: File[];
      folderId?: string;
      onProgress?: (percent: number) => void;
    }) => uploadFiles(files, folderId, onProgress),
    onSuccess: (created) => {
      invalidate();
      toast.success(`${created.length} file${created.length === 1 ? '' : 's'} uploaded`);
    },
    onError: () => toast.error('Upload failed'),
  });
}

export function useUpdateFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFile }) => updateFile(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteFile() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      invalidate();
      toast.success('File deleted');
    },
  });
}

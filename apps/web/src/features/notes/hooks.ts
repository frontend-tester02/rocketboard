'use client';

import type { CreateNoteInput, UpdateNote } from '@rocket/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createNote,
  deleteNote,
  getNote,
  listNoteTags,
  listNotes,
  updateNote,
  type NotesQuery,
} from '@/features/notes/api';

export const noteKeys = {
  all: ['notes'] as const,
  list: (q: NotesQuery) => ['notes', 'list', q] as const,
  tags: () => ['notes', 'tags'] as const,
  detail: (id: string) => ['notes', 'detail', id] as const,
};

export function useNotes(query: NotesQuery) {
  return useQuery({
    queryKey: noteKeys.list(query),
    queryFn: () => listNotes(query),
    placeholderData: keepPreviousData,
  });
}

export function useNoteTags() {
  return useQuery({ queryKey: noteKeys.tags(), queryFn: listNoteTags });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: noteKeys.detail(id ?? ''),
    queryFn: () => getNote(id!),
    enabled: !!id,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: noteKeys.all });
}

export function useCreateNote() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateNoteInput) => createNote(input),
    onSuccess: () => {
      invalidate();
      toast.success('Note created');
    },
  });
}

export function useUpdateNote() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateNote }) => updateNote(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteNote() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      invalidate();
      toast.success('Note deleted');
    },
  });
}

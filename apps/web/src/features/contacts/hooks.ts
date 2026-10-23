'use client';

import type { CreateContactInput, UpdateContact } from '@rocket/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createContact,
  deleteContact,
  getContact,
  listContacts,
  updateContact,
  type ContactsQuery,
} from '@/features/contacts/api';

export const contactKeys = {
  all: ['contacts'] as const,
  list: (q: ContactsQuery) => ['contacts', 'list', q] as const,
  detail: (id: string) => ['contacts', 'detail', id] as const,
};

export function useContacts(query: ContactsQuery) {
  return useQuery({
    queryKey: contactKeys.list(query),
    queryFn: () => listContacts(query),
    placeholderData: keepPreviousData,
  });
}

export function useContact(id: string | null) {
  return useQuery({
    queryKey: contactKeys.detail(id ?? ''),
    queryFn: () => getContact(id!),
    enabled: !!id,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: contactKeys.all });
}

export function useCreateContact() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: CreateContactInput) => createContact(input),
    onSuccess: () => {
      invalidate();
      toast.success('Contact added');
    },
  });
}

export function useUpdateContact() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContact }) => updateContact(id, input),
    onSuccess: () => invalidate(),
  });
}

export function useDeleteContact() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      invalidate();
      toast.success('Contact deleted');
    },
  });
}

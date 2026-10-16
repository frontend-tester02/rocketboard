'use client';

import type { PatchMail, UpdateMailLabel } from '@rocket/shared';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createLabel,
  deleteLabel,
  deleteMail,
  getMail,
  getMailCounts,
  listLabels,
  listMails,
  patchMail,
  saveDraft,
  sendMail,
  updateLabel,
  type MailsQuery,
} from '@/features/mail/api';

export const mailKeys = {
  all: ['mail'] as const,
  list: (q: MailsQuery) => ['mail', 'list', q] as const,
  counts: () => ['mail', 'counts'] as const,
  detail: (id: string) => ['mail', 'detail', id] as const,
  labels: ['mail', 'labels'] as const,
};

export function useMails(query: MailsQuery) {
  return useQuery({
    queryKey: mailKeys.list(query),
    queryFn: () => listMails(query),
    placeholderData: keepPreviousData,
  });
}

export function useMailCounts() {
  return useQuery({ queryKey: mailKeys.counts(), queryFn: getMailCounts });
}

export function useMail(id: string | null) {
  return useQuery({
    queryKey: mailKeys.detail(id ?? ''),
    queryFn: () => getMail(id!),
    enabled: !!id,
  });
}

export function useLabels() {
  return useQuery({
    queryKey: mailKeys.labels,
    queryFn: listLabels,
    staleTime: 5 * 60 * 1000,
  });
}

function useInvalidateMail() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: ['mail', 'list'] });
    void qc.invalidateQueries({ queryKey: mailKeys.counts() });
  };
}

export function useSendMail() {
  const invalidate = useInvalidateMail();
  return useMutation({
    mutationFn: sendMail,
    onSuccess: () => {
      invalidate();
      toast.success('Message sent');
    },
  });
}

export function useSaveDraft() {
  const invalidate = useInvalidateMail();
  return useMutation({
    mutationFn: saveDraft,
    onSuccess: () => {
      invalidate();
      toast.success('Draft saved');
    },
  });
}

export function usePatchMail() {
  const invalidate = useInvalidateMail();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: PatchMail }) =>
      patchMail(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteMail() {
  const invalidate = useInvalidateMail();
  return useMutation({
    mutationFn: deleteMail,
    onSuccess: () => {
      invalidate();
      toast.success('Moved to trash');
    },
  });
}

function useInvalidateLabels() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: mailKeys.labels });
}

export function useCreateLabel() {
  const invalidate = useInvalidateLabels();
  return useMutation({
    mutationFn: createLabel,
    onSuccess: () => {
      invalidate();
      toast.success('Label created');
    },
  });
}

export function useUpdateLabel() {
  const invalidate = useInvalidateLabels();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateMailLabel }) =>
      updateLabel(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteLabel() {
  const invalidate = useInvalidateLabels();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteLabel,
    onSuccess: () => {
      invalidate();
      void qc.invalidateQueries({ queryKey: ['mail', 'list'] });
      toast.success('Label deleted');
    },
  });
}

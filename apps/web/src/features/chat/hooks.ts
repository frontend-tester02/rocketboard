'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createConversation,
  listConversations,
  searchUsers,
} from '@/features/chat/api';

export const chatKeys = {
  conversations: ['chat', 'conversations'] as const,
  users: (q: string) => ['chat', 'users', q] as const,
};

export function useConversations() {
  return useQuery({
    queryKey: chatKeys.conversations,
    queryFn: listConversations,
    refetchOnWindowFocus: true,
  });
}

export function useInvalidateConversations() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: chatKeys.conversations });
}

export function useCreateConversation() {
  const invalidate = useInvalidateConversations();
  return useMutation({
    mutationFn: createConversation,
    onSuccess: invalidate,
  });
}

export function useUserSearch(term: string) {
  return useQuery({
    queryKey: chatKeys.users(term),
    queryFn: () => searchUsers(term || undefined),
    staleTime: 60 * 1000,
  });
}

'use client';

import type { PublicUser } from '@rocket/shared';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  forgotPassword,
  getMe,
  lockSession,
  login,
  logout,
  register,
  resetPassword,
  unlockSession,
} from '@/features/auth/api';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

export function useMe(enabled = true) {
  return useQuery({
    queryKey: authKeys.me,
    queryFn: getMe,
    enabled,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: login,
    onSuccess: (user: PublicUser) => {
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: register,
    onSuccess: (user: PublicUser) => {
      qc.setQueryData(authKeys.me, user);
    },
  });
}

export function useForgotPassword() {
  return useMutation({ mutationFn: forgotPassword });
}

export function useResetPassword() {
  return useMutation({ mutationFn: resetPassword });
}

export function useLock() {
  return useMutation({ mutationFn: lockSession });
}

export function useUnlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: unlockSession,
    onSuccess: (user) => qc.setQueryData(authKeys.me, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      qc.removeQueries({ queryKey: authKeys.me });
    },
  });
}

'use client';

import type { PublicUser } from '@rocket/shared';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { authKeys } from '@/features/auth/hooks';
import { changePassword, updateProfile, uploadAvatar } from '@/features/profile/api';

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user: PublicUser) => {
      qc.setQueryData(authKeys.me, user);
      toast.success('Profile updated');
    },
  });
}

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (user: PublicUser) => {
      qc.setQueryData(authKeys.me, user);
      toast.success('Avatar updated');
    },
    onError: () => toast.error('Could not upload avatar'),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,
    onSuccess: () => toast.success('Password changed'),
    onError: () => toast.error('Could not change password. Check your current password.'),
  });
}

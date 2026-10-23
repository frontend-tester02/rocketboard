import type { ChangePasswordInput, PublicUser, UpdateProfileInput } from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export async function updateProfile(input: UpdateProfileInput): Promise<PublicUser> {
  const { data } = await apiClient.patch<Envelope<PublicUser>>('/users/me', input);
  return data.data;
}

export async function uploadAvatar(file: File): Promise<PublicUser> {
  const form = new FormData();
  form.append('avatar', file);
  const { data } = await apiClient.post<Envelope<PublicUser>>('/users/me/avatar', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.patch('/users/me/password', input);
}

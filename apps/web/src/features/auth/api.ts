import type {
  LoginInput,
  PublicUser,
  RegisterInput,
  ResetPasswordInput,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

// The api wraps single resources as { data: <resource> } (ResponseTransformInterceptor).
interface Envelope<T> {
  data: T;
}

export async function login(input: LoginInput): Promise<PublicUser> {
  const { data } = await apiClient.post<Envelope<PublicUser>>(
    '/auth/login',
    input,
  );
  return data.data;
}

export async function register(input: RegisterInput): Promise<PublicUser> {
  const { data } = await apiClient.post<Envelope<PublicUser>>(
    '/auth/register',
    input,
  );
  return data.data;
}

export async function getMe(): Promise<PublicUser> {
  const { data } = await apiClient.get<Envelope<PublicUser>>('/auth/me');
  return data.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export interface ForgotPasswordResult {
  success: boolean;
  message: string;
  devLink?: string;
}

export async function forgotPassword(
  email: string,
): Promise<ForgotPasswordResult> {
  const { data } = await apiClient.post<Envelope<ForgotPasswordResult>>(
    '/auth/forgot-password',
    { email },
  );
  return data.data;
}

export async function resetPassword(input: ResetPasswordInput): Promise<void> {
  await apiClient.post('/auth/reset-password', input);
}

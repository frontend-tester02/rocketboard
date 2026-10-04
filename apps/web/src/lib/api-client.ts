import type { ApiError } from '@rocket/shared';
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';

/**
 * Shared axios instance. Cookies (httpOnly access/refresh) travel with every
 * request via `withCredentials`, so no Authorization header is set manually.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// --- 401 → refresh → retry ---------------------------------------------------
// A single in-flight refresh is shared across concurrent 401s so we only hit
// /auth/refresh once; queued requests await the same promise, then retry.

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  refreshPromise ??= apiClient
    .post('/auth/refresh')
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const original = error.config as RetriableConfig | undefined;
    const status = error.response?.status;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      original._retry = true;
      try {
        await refreshSession();
        return apiClient(original);
      } catch {
        // Refresh failed — surface the original 401. Redirect to login in the
        // browser so expired sessions land on the auth screen.
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  },
);

/** Narrow an unknown error (e.g. from a mutation) to the shared `ApiError` shape. */
export function toApiError(error: unknown): ApiError | null {
  if (axios.isAxiosError(error) && error.response?.data) {
    return error.response.data as ApiError;
  }
  return null;
}

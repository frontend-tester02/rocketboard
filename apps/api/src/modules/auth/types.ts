import type { UserRole } from '@rocket/shared';
import type { AuthUser } from '../../common';

/** Signed JWT payload for both access and refresh tokens. */
export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

/** Request user attached by the refresh strategy (carries the raw token). */
export interface RefreshUser extends AuthUser {
  refreshToken: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

import { SetMetadata } from '@nestjs/common';

/** Metadata key marking a route as public (skips the global JwtAuthGuard). */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Marks a route (or controller) as accessible without authentication.
 * The global JwtAuthGuard (added in AUTH-B) reads this key.
 */
export const Public = (): MethodDecorator & ClassDecorator =>
  SetMetadata(IS_PUBLIC_KEY, true);

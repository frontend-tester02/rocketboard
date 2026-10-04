import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@rocket/shared';

/** Metadata key listing the roles allowed to access a route. */
export const ROLES_KEY = 'roles';

/**
 * Restricts a route (or controller) to the given roles. Enforced by the
 * RolesGuard (added in AUTH-B).
 *
 *   `@Roles(UserRole.Admin, UserRole.Manager)`
 */
export const Roles = (...roles: UserRole[]): MethodDecorator & ClassDecorator =>
  SetMetadata(ROLES_KEY, roles);

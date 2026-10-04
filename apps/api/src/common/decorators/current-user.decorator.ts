import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Shape attached to `request.user` by the JWT strategy (AUTH-B). */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

/**
 * Injects the authenticated user from the request, or a single property of it.
 *
 *   `@CurrentUser() user: AuthUser`
 *   `@CurrentUser('id') userId: string`
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const user = request.user;
    if (!user) {
      return undefined;
    }
    return data ? user[data] : user;
  },
);

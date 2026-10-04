import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Normalizes successful responses into a consistent envelope:
 *  - paginated payloads (already `{ data, meta }`) pass through unchanged,
 *  - everything else is wrapped as `{ data: <payload> }`.
 *
 * So the client always reads the resource from `body.data`, and lists also
 * carry `body.meta` (page, limit, total, totalPages) — matching the shared
 * `PaginatedResponse<T>` contract.
 */
@Injectable()
export class ResponseTransformInterceptor<T>
  implements NestInterceptor<T, unknown>
{
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    return next.handle().pipe(
      map((payload) => {
        if (this.isPaginated(payload)) {
          return payload;
        }
        return { data: payload ?? null };
      }),
    );
  }

  private isPaginated(payload: unknown): boolean {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'data' in payload &&
      'meta' in payload
    );
  }
}

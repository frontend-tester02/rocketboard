import { ApiPropertyOptional } from '@nestjs/swagger';
import type { PaginationQuery, SortOrder } from '@rocket/shared';

/**
 * Swagger-documented shape of the common list query params. Runtime validation
 * is done with the shared `paginationQuerySchema` via `ZodValidationPipe`:
 *
 *   `@Query(new ZodValidationPipe(paginationQuerySchema)) query: PaginationQueryDto`
 */
export class PaginationQueryDto implements PaginationQuery {
  @ApiPropertyOptional({ minimum: 1, default: 1, description: 'Page number' })
  page!: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: 100,
    default: 10,
    description: 'Items per page',
  })
  limit!: number;

  @ApiPropertyOptional({ description: 'Field to sort by, e.g. "createdAt"' })
  sort?: string;

  @ApiPropertyOptional({ enum: ['asc', 'desc'], default: 'desc' })
  order!: SortOrder;

  @ApiPropertyOptional({ description: 'Free-text search term' })
  search?: string;
}

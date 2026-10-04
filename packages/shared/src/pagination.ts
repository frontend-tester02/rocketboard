// Shared pagination contract used by every list endpoint.
//
// Request:  `PaginationQuery`     -> { page, limit, sort?, order?, search? }
// Response: `PaginatedResponse<T>` -> { data: T[], meta: { page, limit, total, totalPages } }
import { z } from 'zod';

/** Sort direction. */
export const SortOrder = {
  Asc: 'asc',
  Desc: 'desc',
} as const;
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];

/**
 * Query params accepted by any paginated list endpoint. Values arrive as
 * strings on the wire, so `page`/`limit` are coerced to numbers.
 */
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  /** Field name to sort by, e.g. "createdAt". */
  sort: z.string().trim().min(1).optional(),
  order: z.nativeEnum(SortOrder).default(SortOrder.Desc),
  /** Free-text search term. */
  search: z.string().trim().optional(),
});
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
/** Input shape before defaults are applied (what callers may pass). */
export type PaginationQueryInput = z.input<typeof paginationQuerySchema>;

/** Pagination metadata returned alongside a page of results. */
export const paginationMetaSchema = z.object({
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  total: z.number().int().min(0),
  totalPages: z.number().int().min(0),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Builds a Zod schema for a paginated response of `itemSchema`.
 * Use when you need runtime validation of a list payload.
 */
export function paginatedResponseSchema<T extends z.ZodTypeAny>(
  itemSchema: T,
) {
  return z.object({
    data: z.array(itemSchema),
    meta: paginationMetaSchema,
  });
}

/** Generic paginated response envelope. */
export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

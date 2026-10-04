import type { PaginatedResponse, PaginationQuery } from '@rocket/shared';
import type { FilterQuery, Model } from 'mongoose';

export interface PaginateOptions {
  /** Fields to run a case-insensitive regex search over when `query.search` is set. */
  searchFields?: string[];
  /** Sort applied when `query.sort` is not provided. Defaults to newest first. */
  defaultSort?: Record<string, 1 | -1>;
}

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Runs a paginated, optionally-searched + sorted query against a Mongoose
 * model and returns the shared `{ data, meta }` envelope.
 *
 *   `return paginate(this.productModel, query, { status }, { searchFields: ['name', 'sku'] });`
 */
export async function paginate<T>(
  model: Model<T>,
  query: PaginationQuery,
  filter: FilterQuery<T> = {},
  options: PaginateOptions = {},
): Promise<PaginatedResponse<T>> {
  const { page, limit, sort, order, search } = query;

  const finalFilter: FilterQuery<T> = { ...filter };
  if (search && options.searchFields?.length) {
    const rx = new RegExp(escapeRegex(search), 'i');
    (finalFilter as Record<string, unknown>).$or = options.searchFields.map(
      (field) => ({ [field]: rx }),
    );
  }

  const sortSpec: Record<string, 1 | -1> = sort
    ? { [sort]: order === 'asc' ? 1 : -1 }
    : (options.defaultSort ?? { createdAt: -1 });

  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    model.find(finalFilter).sort(sortSpec).skip(skip).limit(limit).exec(),
    model.countDocuments(finalFilter).exec(),
  ]);

  return {
    data: data as unknown as T[],
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

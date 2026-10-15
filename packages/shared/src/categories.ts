// Category contracts shared between web and api.
import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  /** URL slug; derived from the name when omitted. */
  slug: z.string().trim().min(1).max(100).optional(),
  /** Parent category id, for nested categories. */
  parent: z.string().trim().min(1).optional(),
});
export type CreateCategory = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = createCategorySchema.partial();
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

/** Category as returned by the api. */
export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  parent?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Product contracts shared between web (forms, tables) and api (validation).
import { z } from 'zod';
import { ProductStatus, productStatusSchema } from './enums';
import { paginationQuerySchema } from './pagination';

/** Physical shipping dimensions, all optional. */
export const shippingSchema = z.object({
  weight: z.number().nonnegative().optional(),
  width: z.number().nonnegative().optional(),
  height: z.number().nonnegative().optional(),
  length: z.number().nonnegative().optional(),
});
export type Shipping = z.infer<typeof shippingSchema>;

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  description: z.string().trim().max(5000).optional().default(''),
  /** Category id. */
  category: z.string().trim().min(1).optional(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  images: z.array(z.string().trim().url()).optional().default([]),
  price: z.number().nonnegative('Price must be positive'),
  taxIncludedPrice: z.number().nonnegative().optional(),
  taxRule: z.string().trim().optional(),
  unitPrice: z.number().nonnegative().optional(),
  stock: z.number().int().nonnegative().optional().default(0),
  status: productStatusSchema.optional().default(ProductStatus.Available),
  shipping: shippingSchema.optional(),
});
export type CreateProduct = z.infer<typeof createProductSchema>;
export type CreateProductInput = z.input<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProduct = z.infer<typeof updateProductSchema>;

/** List query: pagination + e-commerce filters. */
export const productListQuerySchema = paginationQuerySchema.extend({
  status: productStatusSchema.optional(),
  category: z.string().trim().min(1).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  priceMin: z.coerce.number().nonnegative().optional(),
  priceMax: z.coerce.number().nonnegative().optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;

/** Bulk operation payload (e.g. bulk delete). */
export const bulkProductIdsSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1, 'Select at least one item'),
});
export type BulkProductIds = z.infer<typeof bulkProductIdsSchema>;

/** Tab counts for the products list header. */
export interface ProductCounts {
  all: number;
  available: number;
  disabled: number;
}

/** Product as returned by the api. */
export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  description?: string;
  category?: string;
  tags: string[];
  images: string[];
  price: number;
  taxIncludedPrice?: number;
  taxRule?: string;
  unitPrice?: number;
  stock: number;
  status: ProductStatus;
  shipping?: Shipping;
  createdAt?: string;
  updatedAt?: string;
}

// Shared form schema for the tabbed Add/Edit Product modal (stages 20–24).
// Extended tab-by-tab: Information (20), Images (21), Pricing (22),
// Inventory (23), Shipping (24).
import {
  ProductStatus,
  productStatusSchema,
  type CreateProductInput,
  type ProductDto,
} from '@rocket/shared';
import { z } from 'zod';

export const productFormSchema = z.object({
  // Information
  name: z.string().trim().min(1, 'Product name is required').max(160),
  sku: z.string().trim().min(1, 'SKU is required').max(64),
  description: z.string().trim().max(5000).optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: productStatusSchema.default(ProductStatus.Available),
  // Images (stage 21) — uploaded image URLs, first is the primary.
  images: z.array(z.string()).default([]),
  // Pricing (stage 22) — kept as strings (text inputs); coerced on submit.
  price: z.string().optional(),
  taxIncludedPrice: z.string().optional(),
  taxRule: z.string().optional(),
  unitPrice: z.string().optional(),
  pricePer: z.string().optional(),
  // Inventory (stage 23)
  stock: z.string().optional(),
  // Shipping (stage 24)
  weight: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
  length: z.string().optional(),
});

/** Tax rules with their rate, for the Pricing tab auto-calculation. */
export const taxRules = [
  { value: 'none', label: 'No tax', rate: 0 },
  { value: 'standard', label: 'Standard (20%)', rate: 0.2 },
  { value: 'reduced', label: 'Reduced (10%)', rate: 0.1 },
  { value: 'zero', label: 'Zero (0%)', rate: 0 },
] as const;

export const pricePerOptions = ['item', 'kg', 'g', 'liter', 'pack'] as const;

function toNumber(value?: string): number | undefined {
  if (!value || value.trim() === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export type ProductFormValues = z.input<typeof productFormSchema>;

export const NO_CATEGORY = '__none__';

export const productFormDefaults: ProductFormValues = {
  name: '',
  sku: '',
  description: '',
  category: NO_CATEGORY,
  tags: [],
  status: ProductStatus.Available,
  images: [],
  price: '',
  taxIncludedPrice: '',
  taxRule: 'none',
  unitPrice: '',
  pricePer: 'item',
  stock: '0',
  weight: '',
  width: '',
  height: '',
  length: '',
};

/** Map validated form values to the api's create payload. */
export function toCreateInput(values: ProductFormValues): CreateProductInput {
  return {
    name: values.name,
    sku: values.sku,
    description: values.description || undefined,
    category:
      values.category && values.category !== NO_CATEGORY
        ? values.category
        : undefined,
    tags: values.tags ?? [],
    status: values.status,
    images: values.images ?? [],
    price: toNumber(values.price) ?? 0,
    taxIncludedPrice: toNumber(values.taxIncludedPrice),
    unitPrice: toNumber(values.unitPrice),
    taxRule:
      values.taxRule && values.taxRule !== 'none'
        ? taxRules.find((r) => r.value === values.taxRule)?.label
        : undefined,
    stock: toNumber(values.stock) ?? 0,
    shipping: buildShipping(values),
  };
}

function buildShipping(
  values: ProductFormValues,
): CreateProductInput['shipping'] {
  const shipping = {
    weight: toNumber(values.weight),
    width: toNumber(values.width),
    height: toNumber(values.height),
    length: toNumber(values.length),
  };
  const hasAny = Object.values(shipping).some((v) => v !== undefined);
  return hasAny ? shipping : undefined;
}

/** Populate the form from an existing product (edit mode). */
export function toFormValues(product: ProductDto): ProductFormValues {
  const str = (n?: number) => (n === undefined ? '' : String(n));
  return {
    name: product.name,
    sku: product.sku,
    description: product.description ?? '',
    category: product.category ?? NO_CATEGORY,
    tags: product.tags ?? [],
    status: product.status,
    images: product.images ?? [],
    price: str(product.price),
    taxIncludedPrice: str(product.taxIncludedPrice),
    taxRule:
      taxRules.find((r) => r.label === product.taxRule)?.value ?? 'none',
    unitPrice: str(product.unitPrice),
    pricePer: 'item',
    stock: str(product.stock),
    weight: str(product.shipping?.weight),
    width: str(product.shipping?.width),
    height: str(product.shipping?.height),
    length: str(product.shipping?.length),
  };
}

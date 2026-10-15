import type {
  CategoryDto,
  CreateProductInput,
  PaginatedResponse,
  ProductCounts,
  ProductDto,
  ProductListQuery,
  UpdateProduct,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

/** Query params for the products list; omit empty values from the request. */
export type ProductsQuery = Partial<
  Pick<
    ProductListQuery,
    | 'page'
    | 'limit'
    | 'sort'
    | 'order'
    | 'search'
    | 'status'
    | 'category'
    | 'priceMin'
    | 'priceMax'
  >
> & {
  dateFrom?: string;
  dateTo?: string;
};

function cleanParams(query: ProductsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value as string | number;
  }
  return params;
}

export async function listProducts(
  query: ProductsQuery,
): Promise<PaginatedResponse<ProductDto>> {
  const { data } = await apiClient.get<PaginatedResponse<ProductDto>>(
    '/products',
    { params: cleanParams(query) },
  );
  return data;
}

export async function getProductCounts(): Promise<ProductCounts> {
  const { data } = await apiClient.get<Envelope<ProductCounts>>(
    '/products/counts',
  );
  return data.data;
}

export async function getProduct(id: string): Promise<ProductDto> {
  const { data } = await apiClient.get<Envelope<ProductDto>>(`/products/${id}`);
  return data.data;
}

export async function createProduct(
  input: CreateProductInput,
): Promise<ProductDto> {
  const { data } = await apiClient.post<Envelope<ProductDto>>(
    '/products',
    input,
  );
  return data.data;
}

export async function updateProduct(
  id: string,
  input: UpdateProduct,
): Promise<ProductDto> {
  const { data } = await apiClient.patch<Envelope<ProductDto>>(
    `/products/${id}`,
    input,
  );
  return data.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`);
}

export async function bulkDeleteProducts(
  ids: string[],
): Promise<{ deleted: number }> {
  const { data } = await apiClient.post<Envelope<{ deleted: number }>>(
    '/products/bulk',
    { ids },
  );
  return data.data;
}

export async function getCategories(): Promise<CategoryDto[]> {
  const { data } = await apiClient.get<Envelope<CategoryDto[]>>('/categories');
  return data.data;
}

'use client';

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UpdateProduct } from '@rocket/shared';
import {
  bulkDeleteProducts,
  createProduct,
  deleteProduct,
  getCategories,
  getProduct,
  getProductCounts,
  listProducts,
  updateProduct,
  type ProductsQuery,
} from '@/features/products/api';

export const productKeys = {
  all: ['products'] as const,
  list: (query: ProductsQuery) => ['products', 'list', query] as const,
  counts: () => ['products', 'counts'] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  categories: ['categories'] as const,
};

export function useProducts(query: ProductsQuery) {
  return useQuery({
    queryKey: productKeys.list(query),
    queryFn: () => listProducts(query),
    placeholderData: keepPreviousData,
  });
}

/** Lightweight top-matches query for the search autocomplete dropdown. */
export function useProductSuggestions(term: string) {
  return useQuery({
    queryKey: ['products', 'suggest', term] as const,
    queryFn: () => listProducts({ search: term, limit: 6, page: 1 }),
    enabled: term.trim().length > 0,
    placeholderData: keepPreviousData,
  });
}

export function useProductCounts() {
  return useQuery({
    queryKey: productKeys.counts(),
    queryFn: getProductCounts,
  });
}

export function useProduct(id: string, enabled = true) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    enabled,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  });
}

function useInvalidateProducts() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: productKeys.all });
  };
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      invalidate();
      toast.success('Product created');
    },
  });
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProduct }) =>
      updateProduct(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('Product updated');
    },
  });
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      invalidate();
      toast.success('Product deleted');
    },
  });
}

export function useBulkDeleteProducts() {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: bulkDeleteProducts,
    onSuccess: (res) => {
      invalidate();
      toast.success(`${res.deleted} products deleted`);
    },
  });
}

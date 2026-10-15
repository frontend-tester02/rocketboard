'use client';

import { ProductStatus, type SortOrder } from '@rocket/shared';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { ProductsQuery } from '@/features/products/api';

export type ProductTab = 'all' | 'available' | 'disabled';
export type ProductView = 'list' | 'grid';

const DEFAULT_LIMIT = 10;

export interface ProductsUrlState {
  tab: ProductTab;
  view: ProductView;
  search: string;
  page: number;
  limit: number;
  sort?: string;
  order: SortOrder;
  category?: string;
  priceMin?: number;
  priceMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

/**
 * Single source of truth for the products list, serialized to the URL query so
 * filters/tabs/paging survive refresh and are shareable. Updating any field
 * resets the page to 1 (except when the page itself changes).
 */
export function useProductsUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<ProductsUrlState>(() => {
    const num = (key: string): number | undefined => {
      const raw = searchParams.get(key);
      if (raw == null || raw === '') return undefined;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };
    return {
      tab: (searchParams.get('tab') as ProductTab) || 'all',
      view: (searchParams.get('view') as ProductView) || 'list',
      search: searchParams.get('search') ?? '',
      page: num('page') ?? 1,
      limit: num('limit') ?? DEFAULT_LIMIT,
      sort: searchParams.get('sort') ?? undefined,
      order: (searchParams.get('order') as SortOrder) || 'desc',
      category: searchParams.get('category') ?? undefined,
      priceMin: num('priceMin'),
      priceMax: num('priceMax'),
      dateFrom: searchParams.get('dateFrom') ?? undefined,
      dateTo: searchParams.get('dateTo') ?? undefined,
    };
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, string | number | undefined>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === null) {
          next.delete(key);
        } else {
          next.set(key, String(value));
        }
      }
      if (resetPage && !('page' in updates)) next.delete('page');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // The query object sent to the products API.
  const query = useMemo<ProductsQuery>(() => {
    const status =
      state.tab === 'available'
        ? ProductStatus.Available
        : state.tab === 'disabled'
          ? ProductStatus.Disabled
          : undefined;
    return {
      page: state.page,
      limit: state.limit,
      sort: state.sort,
      order: state.order,
      search: state.search || undefined,
      status,
      category: state.category,
      priceMin: state.priceMin,
      priceMax: state.priceMax,
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
    };
  }, [state]);

  return { state, setParams, query };
}

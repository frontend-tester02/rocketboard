'use client';

import { OrderStatus, type SortOrder } from '@rocket/shared';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { OrdersQuery } from '@/features/orders/api';

export type OrderTab = 'all' | OrderStatus;

const DEFAULT_LIMIT = 10;

export interface OrdersUrlState {
  tab: OrderTab;
  search: string;
  page: number;
  limit: number;
  sort?: string;
  order: SortOrder;
}

export function useOrdersUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<OrdersUrlState>(() => {
    const num = (key: string): number | undefined => {
      const raw = searchParams.get(key);
      if (!raw) return undefined;
      const n = Number(raw);
      return Number.isFinite(n) ? n : undefined;
    };
    return {
      tab: (searchParams.get('tab') as OrderTab) || 'all',
      search: searchParams.get('search') ?? '',
      page: num('page') ?? 1,
      limit: num('limit') ?? DEFAULT_LIMIT,
      sort: searchParams.get('sort') ?? undefined,
      order: (searchParams.get('order') as SortOrder) || 'desc',
    };
  }, [searchParams]);

  const setParams = useCallback(
    (updates: Record<string, string | number | undefined>, resetPage = true) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === null) next.delete(key);
        else next.set(key, String(value));
      }
      if (resetPage && !('page' in updates)) next.delete('page');
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const query = useMemo<OrdersQuery>(
    () => ({
      page: state.page,
      limit: state.limit,
      sort: state.sort,
      order: state.order,
      search: state.search || undefined,
      status: state.tab === 'all' ? undefined : state.tab,
    }),
    [state],
  );

  return { state, setParams, query };
}

'use client';

import type { UpdateOrderStatus } from '@rocket/shared';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getOrder,
  getOrderCounts,
  listOrders,
  updateOrderStatus,
  type OrdersQuery,
} from '@/features/orders/api';

export const orderKeys = {
  all: ['orders'] as const,
  list: (query: OrdersQuery) => ['orders', 'list', query] as const,
  counts: () => ['orders', 'counts'] as const,
  detail: (id: string) => ['orders', 'detail', id] as const,
};

export function useOrders(query: OrdersQuery) {
  return useQuery({
    queryKey: orderKeys.list(query),
    queryFn: () => listOrders(query),
    placeholderData: keepPreviousData,
  });
}

export function useOrderCounts() {
  return useQuery({
    queryKey: orderKeys.counts(),
    queryFn: getOrderCounts,
  });
}

export function useOrder(id: string, enabled = true) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => getOrder(id),
    enabled,
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateOrderStatus }) =>
      updateOrderStatus(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: orderKeys.all });
      toast.success('Order status updated');
    },
  });
}

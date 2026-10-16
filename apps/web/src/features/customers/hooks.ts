'use client';

import type { UpdateCustomer } from '@rocket/shared';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCustomer,
  deleteCustomer,
  getCustomer,
  listCustomers,
  updateCustomer,
  type CustomersQuery,
} from '@/features/customers/api';

export const customerKeys = {
  all: ['customers'] as const,
  list: (query: CustomersQuery) => ['customers', 'list', query] as const,
  detail: (id: string) => ['customers', 'detail', id] as const,
};

export function useCustomers(query: CustomersQuery) {
  return useQuery({
    queryKey: customerKeys.list(query),
    queryFn: () => listCustomers(query),
    placeholderData: keepPreviousData,
  });
}

export function useCustomer(id: string, enabled = true) {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: customerKeys.all });
}

export function useCreateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      invalidate();
      toast.success('Customer created');
    },
  });
}

export function useUpdateCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomer }) =>
      updateCustomer(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('Customer updated');
    },
  });
}

export function useDeleteCustomer() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      invalidate();
      toast.success('Customer deleted');
    },
  });
}

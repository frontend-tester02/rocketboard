import type {
  OrderCounts,
  OrderDto,
  OrderListQuery,
  PaginatedResponse,
  UpdateOrderStatus,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export type OrdersQuery = Partial<
  Pick<OrderListQuery, 'page' | 'limit' | 'sort' | 'order' | 'search' | 'status' | 'paymentType'>
> & {
  dateFrom?: string;
  dateTo?: string;
};

function cleanParams(query: OrdersQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value as string | number;
  }
  return params;
}

export async function listOrders(
  query: OrdersQuery,
): Promise<PaginatedResponse<OrderDto>> {
  const { data } = await apiClient.get<PaginatedResponse<OrderDto>>('/orders', {
    params: cleanParams(query),
  });
  return data;
}

export async function getOrderCounts(): Promise<OrderCounts> {
  const { data } = await apiClient.get<Envelope<OrderCounts>>('/orders/counts');
  return data.data;
}

export async function getOrder(id: string): Promise<OrderDto> {
  const { data } = await apiClient.get<Envelope<OrderDto>>(`/orders/${id}`);
  return data.data;
}

export async function updateOrderStatus(
  id: string,
  input: UpdateOrderStatus,
): Promise<OrderDto> {
  const { data } = await apiClient.patch<Envelope<OrderDto>>(
    `/orders/${id}/status`,
    input,
  );
  return data.data;
}

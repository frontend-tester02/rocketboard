import type {
  CreateCustomerInput,
  CustomerDto,
  CustomerListQuery,
  PaginatedResponse,
  UpdateCustomer,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export type CustomersQuery = Partial<
  Pick<CustomerListQuery, 'page' | 'limit' | 'sort' | 'order' | 'search'>
>;

function cleanParams(query: CustomersQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value as string | number;
  }
  return params;
}

export async function listCustomers(
  query: CustomersQuery,
): Promise<PaginatedResponse<CustomerDto>> {
  const { data } = await apiClient.get<PaginatedResponse<CustomerDto>>(
    '/customers',
    { params: cleanParams(query) },
  );
  return data;
}

export async function getCustomer(id: string): Promise<CustomerDto> {
  const { data } = await apiClient.get<Envelope<CustomerDto>>(
    `/customers/${id}`,
  );
  return data.data;
}

export async function createCustomer(
  input: CreateCustomerInput,
): Promise<CustomerDto> {
  const { data } = await apiClient.post<Envelope<CustomerDto>>(
    '/customers',
    input,
  );
  return data.data;
}

export async function updateCustomer(
  id: string,
  input: UpdateCustomer,
): Promise<CustomerDto> {
  const { data } = await apiClient.patch<Envelope<CustomerDto>>(
    `/customers/${id}`,
    input,
  );
  return data.data;
}

export async function deleteCustomer(id: string): Promise<void> {
  await apiClient.delete(`/customers/${id}`);
}

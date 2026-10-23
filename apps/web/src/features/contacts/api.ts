import type { ContactDto, CreateContactInput, UpdateContact } from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export interface ContactsQuery {
  search?: string;
  favorite?: boolean;
}

function cleanParams(q: ContactsQuery): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '' || v === false) continue;
    params[k] = String(v);
  }
  return params;
}

export async function listContacts(query: ContactsQuery): Promise<ContactDto[]> {
  const { data } = await apiClient.get<Envelope<ContactDto[]>>('/contacts', {
    params: cleanParams(query),
  });
  return data.data;
}

export async function getContact(id: string): Promise<ContactDto> {
  const { data } = await apiClient.get<Envelope<ContactDto>>(`/contacts/${id}`);
  return data.data;
}

export async function createContact(input: CreateContactInput): Promise<ContactDto> {
  const { data } = await apiClient.post<Envelope<ContactDto>>('/contacts', input);
  return data.data;
}

export async function updateContact(id: string, input: UpdateContact): Promise<ContactDto> {
  const { data } = await apiClient.patch<Envelope<ContactDto>>(`/contacts/${id}`, input);
  return data.data;
}

export async function deleteContact(id: string): Promise<void> {
  await apiClient.delete(`/contacts/${id}`);
}

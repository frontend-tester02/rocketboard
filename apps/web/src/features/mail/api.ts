import type {
  ComposeMailInput,
  CreateMailLabel,
  DraftMailInput,
  MailCounts,
  MailDto,
  MailLabelDto,
  MailListQuery,
  PaginatedResponse,
  PatchMail,
  UpdateMailLabel,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export type MailsQuery = Partial<
  Pick<MailListQuery, 'page' | 'limit' | 'search' | 'folder' | 'label'>
>;

function cleanParams(query: MailsQuery): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params[key] = value as string | number;
  }
  return params;
}

export async function listMails(
  query: MailsQuery,
): Promise<PaginatedResponse<MailDto>> {
  const { data } = await apiClient.get<PaginatedResponse<MailDto>>('/mails', {
    params: cleanParams(query),
  });
  return data;
}

export async function getMailCounts(): Promise<MailCounts> {
  const { data } = await apiClient.get<Envelope<MailCounts>>('/mails/counts');
  return data.data;
}

export async function getMail(id: string): Promise<MailDto> {
  const { data } = await apiClient.get<Envelope<MailDto>>(`/mails/${id}`);
  return data.data;
}

export async function sendMail(input: ComposeMailInput): Promise<MailDto> {
  const { data } = await apiClient.post<Envelope<MailDto>>('/mails', input);
  return data.data;
}

export async function saveDraft(input: DraftMailInput): Promise<MailDto> {
  const { data } = await apiClient.post<Envelope<MailDto>>('/mails/draft', input);
  return data.data;
}

export async function patchMail(id: string, input: PatchMail): Promise<MailDto> {
  const { data } = await apiClient.patch<Envelope<MailDto>>(`/mails/${id}`, input);
  return data.data;
}

export async function deleteMail(id: string): Promise<void> {
  await apiClient.delete(`/mails/${id}`);
}

export async function listLabels(): Promise<MailLabelDto[]> {
  const { data } = await apiClient.get<Envelope<MailLabelDto[]>>('/mail-labels');
  return data.data;
}

export async function createLabel(input: CreateMailLabel): Promise<MailLabelDto> {
  const { data } = await apiClient.post<Envelope<MailLabelDto>>('/mail-labels', input);
  return data.data;
}

export async function updateLabel(
  id: string,
  input: UpdateMailLabel,
): Promise<MailLabelDto> {
  const { data } = await apiClient.patch<Envelope<MailLabelDto>>(
    `/mail-labels/${id}`,
    input,
  );
  return data.data;
}

export async function deleteLabel(id: string): Promise<void> {
  await apiClient.delete(`/mail-labels/${id}`);
}

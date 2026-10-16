import type {
  ChatUser,
  ConversationDto,
  CreateConversationInput,
  MessageDto,
  SendMessageInput,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export async function listConversations(): Promise<ConversationDto[]> {
  const { data } = await apiClient.get<Envelope<ConversationDto[]>>('/conversations');
  return data.data;
}

export async function createConversation(
  input: CreateConversationInput,
): Promise<ConversationDto> {
  const { data } = await apiClient.post<Envelope<ConversationDto>>(
    '/conversations',
    input,
  );
  return data.data;
}

export async function getMessages(
  conversationId: string,
  cursor?: string,
): Promise<MessageDto[]> {
  const { data } = await apiClient.get<Envelope<MessageDto[]>>(
    `/conversations/${conversationId}/messages`,
    { params: cursor ? { cursor } : {} },
  );
  return data.data;
}

export async function sendMessageRest(
  conversationId: string,
  input: SendMessageInput,
): Promise<MessageDto> {
  const { data } = await apiClient.post<Envelope<MessageDto>>(
    `/conversations/${conversationId}/messages`,
    input,
  );
  return data.data;
}

export async function addMembers(
  conversationId: string,
  members: string[],
): Promise<ConversationDto> {
  const { data } = await apiClient.post<Envelope<ConversationDto>>(
    `/conversations/${conversationId}/members`,
    { members },
  );
  return data.data;
}

export async function searchUsers(search?: string): Promise<ChatUser[]> {
  const { data } = await apiClient.get<Envelope<ChatUser[]>>('/users', {
    params: search ? { search } : {},
  });
  return data.data;
}

import { ConversationType, type ChatUser, type ConversationDto, type MessageDto } from '@rocket/shared';

export function convPartner(conv: ConversationDto, meId: string): ChatUser | undefined {
  return conv.members.find((m) => m.id !== meId);
}

export function convTitle(conv: ConversationDto, meId: string): string {
  if (conv.type === ConversationType.Team) return conv.name ?? 'Group chat';
  const partner = convPartner(conv, meId);
  return partner ? `${partner.firstName} ${partner.lastName}` : 'Conversation';
}

export function convAvatarName(conv: ConversationDto, meId: string): string {
  if (conv.type === ConversationType.Team) return conv.name ?? 'Group';
  const partner = convPartner(conv, meId);
  return partner ? `${partner.firstName} ${partner.lastName}` : 'Chat';
}

export function senderId(message: MessageDto): string {
  return typeof message.sender === 'string' ? message.sender : message.sender.id;
}

export function senderName(message: MessageDto): string {
  return typeof message.sender === 'string'
    ? 'User'
    : `${message.sender.firstName} ${message.sender.lastName}`;
}

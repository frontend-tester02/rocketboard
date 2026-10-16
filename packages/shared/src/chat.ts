// Chat contracts shared between web and api.
import { z } from 'zod';
import { ConversationType, conversationTypeSchema } from './enums';

export const chatAttachmentSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().trim().url(),
  size: z.number().int().nonnegative().optional(),
});
export type ChatAttachment = z.infer<typeof chatAttachmentSchema>;

export const createConversationSchema = z.object({
  type: conversationTypeSchema.optional().default(ConversationType.Private),
  name: z.string().trim().max(80).optional(),
  avatar: z.string().trim().url().optional(),
  /** Other member user ids (the creator is added automatically). */
  members: z.array(z.string().trim().min(1)).min(1, 'Add at least one member'),
});
export type CreateConversation = z.infer<typeof createConversationSchema>;
export type CreateConversationInput = z.input<typeof createConversationSchema>;

export const sendMessageSchema = z
  .object({
    text: z.string().trim().max(5000).optional().default(''),
    attachments: z.array(chatAttachmentSchema).optional().default([]),
  })
  .refine((d) => !!d.text || (d.attachments?.length ?? 0) > 0, {
    message: 'Message cannot be empty',
    path: ['text'],
  });
export type SendMessage = z.infer<typeof sendMessageSchema>;
export type SendMessageInput = z.input<typeof sendMessageSchema>;

export const addMembersSchema = z.object({
  members: z.array(z.string().trim().min(1)).min(1),
});
export type AddMembers = z.infer<typeof addMembersSchema>;

export const messageListQuerySchema = z.object({
  /** Message id to page before (older messages). */
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
export type MessageListQuery = z.infer<typeof messageListQuerySchema>;

export interface ChatUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface MessageDto {
  id: string;
  conversation: string;
  sender: ChatUser | string;
  text: string;
  attachments: ChatAttachment[];
  readBy: string[];
  createdAt?: string;
}

export interface ConversationDto {
  id: string;
  type: ConversationType;
  name?: string;
  avatar?: string;
  members: ChatUser[];
  admins: string[];
  lastMessage?: {
    text: string;
    sender: string;
    createdAt?: string;
  };
  unread?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ── Socket event payloads (used by the gateway in CHAT-B2) ──────────────────
export interface MessageNewEvent {
  message: MessageDto;
  conversation: string;
}
export interface TypingEvent {
  conversation: string;
  user: string;
}
export interface PresenceEvent {
  user: string;
  online: boolean;
}

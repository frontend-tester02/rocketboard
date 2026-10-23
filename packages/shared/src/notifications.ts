// Notification contracts shared between web and api.
import { z } from 'zod';
import { NotificationType } from './enums';

export const notificationListQuerySchema = z.object({
  unread: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type NotificationListQuery = z.infer<typeof notificationListQuerySchema>;

export interface NotificationDto {
  id: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  isRead: boolean;
  createdAt?: string;
}

export interface NotificationFeed {
  data: NotificationDto[];
  unread: number;
}

/** EventEmitter2 channel + payload used to raise a notification from services. */
export const NOTIFY_EVENT = 'notification.created';
export interface NotifyEventPayload {
  user: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  payload?: Record<string, unknown>;
}

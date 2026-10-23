// Activity / timeline contracts shared between web and api.
import { z } from 'zod';

/** Entity kinds that can appear in the activity feed. */
export const ActivityEntityType = {
  Project: 'project',
  Task: 'task',
  File: 'file',
} as const;
export type ActivityEntityType =
  (typeof ActivityEntityType)[keyof typeof ActivityEntityType];
export const activityEntityTypeSchema = z.nativeEnum(ActivityEntityType);

export const activityListQuerySchema = z.object({
  entityType: activityEntityTypeSchema.optional(),
  cursor: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
});
export type ActivityListQuery = z.infer<typeof activityListQuerySchema>;

export interface ActivityActor {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface ActivityDto {
  id: string;
  actor: ActivityActor | null;
  action: string;
  entityType: ActivityEntityType;
  entityId: string;
  meta?: Record<string, unknown>;
  createdAt?: string;
}

export interface ActivityFeed {
  data: ActivityDto[];
  nextCursor: string | null;
}

/** EventEmitter2 channel + payload used to record activity from services. */
export const ACTIVITY_EVENT = 'activity.created';
export interface ActivityEventPayload {
  actor: string;
  action: string;
  entityType: ActivityEntityType;
  entityId: string;
  meta?: Record<string, unknown>;
}

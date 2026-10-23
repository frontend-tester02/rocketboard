import type { ActivityEntityType, ActivityFeed } from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export async function listActivities(query: {
  entityType?: ActivityEntityType;
  cursor?: string;
  limit?: number;
}): Promise<ActivityFeed> {
  const params: Record<string, string> = {};
  if (query.entityType) params.entityType = query.entityType;
  if (query.cursor) params.cursor = query.cursor;
  if (query.limit) params.limit = String(query.limit);
  const { data } = await apiClient.get<Envelope<ActivityFeed>>('/activities', { params });
  return data.data;
}

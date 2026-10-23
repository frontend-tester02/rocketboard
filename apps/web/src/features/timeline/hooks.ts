'use client';

import type { ActivityEntityType } from '@rocket/shared';
import { useInfiniteQuery } from '@tanstack/react-query';
import { listActivities } from '@/features/timeline/api';

export function useActivities(entityType?: ActivityEntityType) {
  return useInfiniteQuery({
    queryKey: ['activities', entityType ?? 'all'],
    queryFn: ({ pageParam }) => listActivities({ entityType, cursor: pageParam }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

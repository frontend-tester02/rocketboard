import { Suspense } from 'react';
import { TasksPageClient } from '@/features/tasks/components/board-page-client';

export default function TaskListPage() {
  return (
    <Suspense fallback={null}>
      <TasksPageClient view="list" />
    </Suspense>
  );
}

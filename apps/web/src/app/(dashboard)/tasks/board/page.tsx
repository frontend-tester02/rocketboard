import { Suspense } from 'react';
import { TasksPageClient } from '@/features/tasks/components/board-page-client';

export default function TaskBoardPage() {
  return (
    <Suspense fallback={null}>
      <TasksPageClient view="board" />
    </Suspense>
  );
}

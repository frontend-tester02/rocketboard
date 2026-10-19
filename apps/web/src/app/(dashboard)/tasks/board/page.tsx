import { Suspense } from 'react';
import { BoardPageClient } from '@/features/tasks/components/board-page-client';

export default function TaskBoardPage() {
  return (
    <Suspense fallback={null}>
      <BoardPageClient />
    </Suspense>
  );
}

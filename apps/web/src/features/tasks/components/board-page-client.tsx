'use client';

import { PageHeader } from '@/components/common/page-header';
import { BoardView } from '@/features/tasks/components/board-view';
import { useBoard, useBoards } from '@/features/tasks/hooks';

export function BoardPageClient() {
  const boardsQuery = useBoards();
  const boardId = boardsQuery.data?.[0]?.id ?? null;
  const boardQuery = useBoard(boardId);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={boardQuery.data?.name ?? 'Task Board'} />

      {boardQuery.isLoading || boardsQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading board…
        </div>
      ) : boardQuery.data ? (
        <BoardView board={boardQuery.data} />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          No board found.
        </div>
      )}
    </div>
  );
}

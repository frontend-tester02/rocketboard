'use client';

import type { TaskDto } from '@rocket/shared';
import { Columns3, List, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import {
  BoardFilter,
  activeFilterCount,
  matchesFilter,
  type BoardFilterValues,
} from '@/features/tasks/components/board-filter';
import { BoardView } from '@/features/tasks/components/board-view';
import { TaskDetailsModal } from '@/features/tasks/components/task-details-modal';
import { TaskListView } from '@/features/tasks/components/task-list-view';
import { useBoard, useBoards } from '@/features/tasks/hooks';
import { cn } from '@/lib/utils';

export function TasksPageClient({ view = 'board' }: { view?: 'board' | 'list' }) {
  const boardsQuery = useBoards();
  const boardId = boardsQuery.data?.[0]?.id ?? null;
  const boardQuery = useBoard(boardId);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filterValues = useMemo<BoardFilterValues>(
    () => ({
      search: searchParams.get('search') ?? undefined,
      priority: searchParams.get('priority') ?? undefined,
      label: searchParams.get('label') ?? undefined,
      due: searchParams.get('due') ?? undefined,
    }),
    [searchParams],
  );

  const setFilter = useCallback(
    (updates: Partial<BoardFilterValues>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === '' || v === null) next.delete(k);
        else next.set(k, String(v));
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const predicate = useCallback(
    (t: TaskDto) => matchesFilter(t, filterValues),
    [filterValues],
  );

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const openTask = boardQuery.data?.tasks.find((t) => t.id === openTaskId) ?? null;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={boardQuery.data?.name ?? 'Task Board'}
        actions={
          <>
            <div className="hidden items-center gap-2 sm:flex">
              <Search className="size-4 text-muted-foreground" />
              <SearchInput
                value={filterValues.search ?? ''}
                onChange={(v) => setFilter({ search: v || undefined })}
                placeholder="Search tasks…"
                className="w-56"
              />
            </div>
            <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5">
              <Link
                href="/tasks/board"
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-md transition-colors',
                  view === 'board' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label="Board view"
              >
                <Columns3 className="size-4" />
              </Link>
              <Link
                href="/tasks/list"
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-md transition-colors',
                  view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
                )}
                aria-label="List view"
              >
                <List className="size-4" />
              </Link>
            </div>
            <BoardFilter
              value={filterValues}
              onChange={setFilter}
              activeCount={activeFilterCount(filterValues)}
            />
          </>
        }
      />

      {boardQuery.isLoading || boardsQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading board…
        </div>
      ) : boardQuery.data ? (
        view === 'list' ? (
          <TaskListView board={boardQuery.data} filter={predicate} onOpenTask={(t) => setOpenTaskId(t.id)} />
        ) : (
          <BoardView board={boardQuery.data} filter={predicate} onOpenTask={(t) => setOpenTaskId(t.id)} />
        )
      ) : (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          No board found.
        </div>
      )}

      {openTask && boardId && (
        <TaskDetailsModal
          task={openTask}
          boardId={boardId}
          open={openTaskId !== null}
          onOpenChange={(o) => !o && setOpenTaskId(null)}
        />
      )}
    </div>
  );
}

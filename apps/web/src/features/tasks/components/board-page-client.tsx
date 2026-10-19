'use client';

import type { TaskDto } from '@rocket/shared';
import { Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import {
  BoardFilter,
  activeFilterCount,
  matchesFilter,
  type BoardFilterValues,
} from '@/features/tasks/components/board-filter';
import { BoardView } from '@/features/tasks/components/board-view';
import { useBoard, useBoards } from '@/features/tasks/hooks';

export function BoardPageClient() {
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
        <BoardView board={boardQuery.data} filter={predicate} />
      ) : (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          No board found.
        </div>
      )}
    </div>
  );
}

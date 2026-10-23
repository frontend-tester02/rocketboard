'use client';

import { ActivityEntityType, type ActivityDto } from '@rocket/shared';
import { format, isToday, isYesterday } from 'date-fns';
import { CheckSquare, FolderKanban, HardDrive, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { UserAvatar } from '@/components/common/user-avatar';
import { useActivities } from '@/features/timeline/hooks';
import { cn } from '@/lib/utils';

const FILTERS: { label: string; value?: ActivityEntityType }[] = [
  { label: 'All', value: undefined },
  { label: 'Projects', value: ActivityEntityType.Project },
  { label: 'Tasks', value: ActivityEntityType.Task },
  { label: 'Files', value: ActivityEntityType.File },
];

const entityIcon: Record<ActivityEntityType, LucideIcon> = {
  [ActivityEntityType.Project]: FolderKanban,
  [ActivityEntityType.Task]: CheckSquare,
  [ActivityEntityType.File]: HardDrive,
};

function dayLabel(iso?: string): string {
  if (!iso) return 'Earlier';
  const d = new Date(iso);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'd MMM yyyy');
}

function describe(a: ActivityDto): string {
  const name = (a.meta?.name as string) || (a.meta?.title as string) || '';
  return `${a.action} ${a.entityType}${name ? ` “${name}”` : ''}`;
}

export function TimelinePageClient() {
  const [filterIndex, setFilterIndex] = useState(0);
  const entityType = FILTERS[filterIndex]!.value;
  const query = useActivities(entityType);

  const items = query.data?.pages.flatMap((p) => p.data) ?? [];

  // Group consecutive activities by day label.
  const groups: { label: string; items: ActivityDto[] }[] = [];
  for (const a of items) {
    const label = dayLabel(a.createdAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(a);
    else groups.push({ label, items: [a] });
  }

  // Infinite scroll sentinel.
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
        void query.fetchNextPage();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [query]);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Timeline" />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f, i) => (
          <button
            key={f.label}
            type="button"
            onClick={() => setFilterIndex(i)}
            className={cn(
              'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
              i === filterIndex
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border/60 text-muted-foreground hover:text-foreground',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {query.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : items.length === 0 ? (
        <EmptyState title="No activity yet" description="Actions across projects, tasks and files will show up here." />
      ) : (
        <div className="flex flex-col gap-6">
          {groups.map((group) => (
            <section key={group.label}>
              <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group.label}
              </h2>
              <ol className="relative flex flex-col gap-4 border-l border-border/60 pl-6">
                {group.items.map((a) => (
                  <TimelineRow key={a.id} activity={a} />
                ))}
              </ol>
            </section>
          ))}

          <div ref={sentinel} className="h-8">
            {query.isFetchingNextPage && (
              <p className="text-center text-sm text-muted-foreground">Loading more…</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TimelineRow({ activity }: { activity: ActivityDto }) {
  const Icon = entityIcon[activity.entityType];
  const actorName = activity.actor
    ? `${activity.actor.firstName} ${activity.actor.lastName}`.trim()
    : 'Someone';
  const danger = activity.action === 'deleted';

  return (
    <li className="relative">
      {/* Node */}
      <span
        className={cn(
          'absolute -left-[31px] top-0.5 flex size-5 items-center justify-center rounded-full ring-4 ring-background',
          danger ? 'bg-danger/15 text-danger' : 'bg-primary/15 text-primary',
        )}
      >
        <Icon className="size-3" />
      </span>

      <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm">
        <UserAvatar name={actorName} src={activity.actor?.avatar} className="size-8" />
        <div className="min-w-0 flex-1">
          <p className="text-sm">
            <span className="font-medium">{actorName}</span>{' '}
            <span className="text-muted-foreground">{describe(activity)}</span>
          </p>
          {activity.createdAt && (
            <p className="mt-0.5 text-xs text-muted-foreground/70">
              {format(new Date(activity.createdAt), 'HH:mm')}
            </p>
          )}
        </div>
      </div>
    </li>
  );
}

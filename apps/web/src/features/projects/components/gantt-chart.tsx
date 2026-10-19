'use client';

import type { ProjectDto, TaskDto } from '@rocket/shared';
import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  eachMonthOfInterval,
  eachWeekOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  getDaysInMonth,
  isWeekend,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { priorityMeta } from '@/features/tasks/task-meta';
import { useProjectTasks, useUpdateProject } from '@/features/projects/hooks';
import { cn } from '@/lib/utils';

type Granularity = 'day' | 'week' | 'month';
const PX_PER_DAY: Record<Granularity, number> = { day: 40, week: 18, month: 5 };
const ROW_H = 44;
const HEADER_H = 52;
const LEFT_W = 260;

function taskProgress(t: TaskDto) {
  const items = t.checklist ?? [];
  if (!items.length) return 0;
  return Math.round((items.filter((i) => i.done).length / items.length) * 100);
}

interface Bar {
  start: Date;
  end: Date;
  progress: number;
}

interface Tick {
  left: number;
  width: number;
  label: string;
  sub?: string;
  weekend?: boolean;
}

/** Project bar from start→end; falls back to a short span if dates are missing. */
function projectBar(p: ProjectDto): Bar | null {
  if (!p.startDate && !p.endDate) return null;
  const start = p.startDate ? new Date(p.startDate) : new Date(p.endDate!);
  const end = p.endDate ? new Date(p.endDate) : addDays(start, 7);
  return { start, end, progress: p.progress };
}

/** Task bar: spans project start (or 5 days before due) → due date. */
function taskBar(t: TaskDto, project: ProjectDto): Bar | null {
  if (!t.dueDate) return null;
  const end = new Date(t.dueDate);
  const start = project.startDate ? new Date(project.startDate) : addDays(end, -5);
  return { start: start < end ? start : addDays(end, -3), end, progress: taskProgress(t) };
}

export function GanttChart({
  projects,
  onOpenTask,
}: {
  projects: ProjectDto[];
  onOpenTask: (task: TaskDto) => void;
}) {
  const [granularity, setGranularity] = useState<Granularity>('week');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const pxPerDay = PX_PER_DAY[granularity];

  const updateProject = useUpdateProject();

  // Overall date range across all project bars, aligned to the granularity.
  const { rangeStart, totalDays } = useMemo(() => {
    const dates: Date[] = [];
    for (const p of projects) {
      const b = projectBar(p);
      if (b) dates.push(b.start, b.end);
    }
    const today = new Date();
    let min = dates.length ? new Date(Math.min(...dates.map((d) => d.getTime()))) : addDays(today, -14);
    let max = dates.length ? new Date(Math.max(...dates.map((d) => d.getTime()))) : addDays(today, 30);
    if (granularity === 'month') {
      min = startOfMonth(min);
      max = endOfMonth(max);
    } else {
      min = startOfWeek(min, { weekStartsOn: 1 });
      max = endOfWeek(max, { weekStartsOn: 1 });
    }
    return { rangeStart: min, totalDays: differenceInCalendarDays(max, min) + 1 };
  }, [projects, granularity]);

  const totalPx = totalDays * pxPerDay;
  const xOf = (d: Date) => differenceInCalendarDays(d, rangeStart) * pxPerDay;
  const todayX = xOf(new Date()) + pxPerDay / 2;

  const ticks = useMemo<Tick[]>(() => {
    const end = addDays(rangeStart, totalDays - 1);
    if (granularity === 'month') {
      return eachMonthOfInterval({ start: rangeStart, end }).map((d) => ({
        left: xOf(d),
        width: getDaysInMonth(d) * pxPerDay,
        label: format(d, 'MMM yyyy'),
      }));
    }
    if (granularity === 'week') {
      return eachWeekOfInterval({ start: rangeStart, end }, { weekStartsOn: 1 }).map((d) => ({
        left: xOf(d),
        width: 7 * pxPerDay,
        label: format(d, 'd MMM'),
      }));
    }
    return eachDayOfInterval({ start: rangeStart, end }).map((d) => ({
      left: xOf(d),
      width: pxPerDay,
      label: format(d, 'd'),
      sub: format(d, 'EEEEE'),
      weekend: isWeekend(d),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, totalDays, granularity, pxPerDay]);

  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2.5">
        <span className="text-sm font-medium text-muted-foreground">Timeline</span>
        <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5">
          {(['day', 'week', 'month'] as Granularity[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGranularity(g)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors',
                granularity === g ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="flex">
        {/* Left tree */}
        <div className="shrink-0 border-r border-border/60" style={{ width: LEFT_W }}>
          <div
            className="flex items-center border-b border-border/60 px-4 text-xs font-medium text-muted-foreground"
            style={{ height: HEADER_H }}
          >
            Project / Task
          </div>
          {projects.map((p) => (
            <ProjectTreeRows
              key={p.id}
              project={p}
              expanded={expanded.has(p.id)}
              onToggle={() =>
                setExpanded((s) => {
                  const n = new Set(s);
                  n.has(p.id) ? n.delete(p.id) : n.add(p.id);
                  return n;
                })
              }
            />
          ))}
        </div>

        {/* Right timeline */}
        <div className="flex-1 overflow-x-auto">
          <div className="relative" style={{ width: totalPx }}>
            {/* Header ticks */}
            <div className="relative border-b border-border/60" style={{ height: HEADER_H }}>
              {ticks.map((t, i) => (
                <div
                  key={i}
                  className={cn(
                    'absolute top-0 flex h-full flex-col items-center justify-center border-l border-border/40 text-xs',
                    t.weekend ? 'bg-muted/40 text-muted-foreground' : 'text-muted-foreground',
                  )}
                  style={{ left: t.left, width: t.width }}
                >
                  {t.sub && <span className="text-[10px] uppercase opacity-70">{t.sub}</span>}
                  <span className="font-medium">{t.label}</span>
                </div>
              ))}
            </div>

            {/* Today line */}
            {todayX >= 0 && todayX <= totalPx && (
              <div
                className="pointer-events-none absolute z-10 w-px bg-danger/70"
                style={{ left: todayX, top: HEADER_H, bottom: 0 }}
              >
                <span className="absolute top-0 left-0 whitespace-nowrap rounded-b rounded-tl-none bg-danger px-1.5 py-0.5 text-[9px] font-medium text-white">
                  Today
                </span>
              </div>
            )}

            {/* Rows */}
            {projects.map((p) => (
              <ProjectTimelineRows
                key={p.id}
                project={p}
                expanded={expanded.has(p.id)}
                xOf={xOf}
                pxPerDay={pxPerDay}
                onDragEnd={(deltaDays) => {
                  const b = projectBar(p);
                  if (!b || deltaDays === 0) return;
                  updateProject.mutate({
                    id: p.id,
                    input: {
                      startDate: p.startDate ? addDays(new Date(p.startDate), deltaDays) : undefined,
                      endDate: p.endDate ? addDays(new Date(p.endDate), deltaDays) : undefined,
                    },
                  });
                }}
                onOpenTask={onOpenTask}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Left tree ─────────────────────────────────────────────────────────────── */

function ProjectTreeRows({
  project,
  expanded,
  onToggle,
}: {
  project: ProjectDto;
  expanded: boolean;
  onToggle: () => void;
}) {
  const tasksQuery = useProjectTasks(expanded ? project.id : null);
  const tasks = tasksQuery.data ?? [];
  const color = project.coverColor || '#3E4DF5';

  return (
    <>
      <div className="flex items-center gap-1.5 border-b border-border/60 px-2 pr-3" style={{ height: ROW_H }}>
        <button
          type="button"
          onClick={onToggle}
          className="flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label={expanded ? 'Collapse' : 'Expand'}
        >
          {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </button>
        <span className="size-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <span className="truncate text-sm font-medium">{project.name}</span>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground">{project.progress}%</span>
      </div>
      {expanded &&
        tasks.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 border-b border-border/60 pl-9 pr-3"
            style={{ height: ROW_H }}
          >
            <span className="truncate text-sm text-muted-foreground">{t.title}</span>
          </div>
        ))}
      {expanded && !tasksQuery.isLoading && tasks.length === 0 && (
        <div className="flex items-center border-b border-border/60 pl-9 text-xs text-muted-foreground" style={{ height: ROW_H }}>
          No tasks
        </div>
      )}
    </>
  );
}

/* ── Right timeline rows ──────────────────────────────────────────────────── */

function ProjectTimelineRows({
  project,
  expanded,
  xOf,
  pxPerDay,
  onDragEnd,
  onOpenTask,
}: {
  project: ProjectDto;
  expanded: boolean;
  xOf: (d: Date) => number;
  pxPerDay: number;
  onDragEnd: (deltaDays: number) => void;
  onOpenTask: (task: TaskDto) => void;
}) {
  const tasksQuery = useProjectTasks(expanded ? project.id : null);
  const tasks = tasksQuery.data ?? [];
  const color = project.coverColor || '#3E4DF5';
  const pBar = projectBar(project);

  return (
    <>
      <GanttRow>
        {pBar && (
          <TaskBarEl
            left={xOf(pBar.start)}
            width={Math.max(pxPerDay, (differenceInCalendarDays(pBar.end, pBar.start) + 1) * pxPerDay)}
            color={color}
            progress={pBar.progress}
            pxPerDay={pxPerDay}
            draggable
            onDragEnd={onDragEnd}
            preview={
              <BarPreview
                title={project.name}
                subtitle={project.client}
                start={pBar.start}
                end={pBar.end}
                progress={pBar.progress}
              />
            }
          />
        )}
      </GanttRow>
      {expanded &&
        tasks.map((t) => {
          const b = taskBar(t, project);
          const meta = priorityMeta[t.priority];
          return (
            <GanttRow key={t.id}>
              {b && (
                <TaskBarEl
                  left={xOf(b.start)}
                  width={Math.max(pxPerDay, (differenceInCalendarDays(b.end, b.start) + 1) * pxPerDay)}
                  colorClass={meta.bar}
                  progress={b.progress}
                  pxPerDay={pxPerDay}
                  preview={
                    <BarPreview
                      title={t.title}
                      subtitle={t.assignees[0]}
                      start={b.start}
                      end={b.end}
                      progress={b.progress}
                      onOpen={() => onOpenTask(t)}
                      openLabel="Open task"
                    />
                  }
                />
              )}
            </GanttRow>
          );
        })}
      {expanded && !tasksQuery.isLoading && tasks.length === 0 && <GanttRow />}
    </>
  );
}

function GanttRow({ children }: { children?: React.ReactNode }) {
  return (
    <div className="relative border-b border-border/60" style={{ height: ROW_H }}>
      {children}
    </div>
  );
}

/* ── Bar element with drag + preview popover ──────────────────────────────── */

function TaskBarEl({
  left,
  width,
  color,
  colorClass,
  progress,
  pxPerDay,
  draggable,
  onDragEnd,
  preview,
}: {
  left: number;
  width: number;
  color?: string;
  colorClass?: string;
  progress: number;
  pxPerDay: number;
  draggable?: boolean;
  onDragEnd?: (deltaDays: number) => void;
  preview: React.ReactNode;
}) {
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const drag = useRef<{ startX: number; moved: boolean } | null>(null);

  function onPointerDown(e: React.PointerEvent) {
    if (!draggable) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { startX: e.clientX, moved: false };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    setOffset(dx);
  }
  function onPointerUp() {
    if (!drag.current) return;
    const moved = drag.current.moved;
    const deltaDays = Math.round(offset / pxPerDay);
    drag.current = null;
    setOffset(0);
    if (moved) {
      onDragEnd?.(deltaDays);
    } else {
      setOpen((v) => !v);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div
          role="button"
          tabIndex={0}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={() => {
            if (!draggable) setOpen((v) => !v);
          }}
          className={cn(
            'group absolute top-1/2 flex -translate-y-1/2 items-center overflow-hidden rounded-md text-[11px] font-medium shadow-sm',
            draggable ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
            colorClass,
          )}
          style={{
            left: left + offset,
            width,
            height: 22,
            background: color,
          }}
          title={`${progress}%`}
        >
          <div
            className="absolute inset-y-0 left-0 bg-black/20"
            style={{ width: `${progress}%` }}
          />
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-60 p-3" align="start" sideOffset={8}>
        {preview}
      </PopoverContent>
    </Popover>
  );
}

function BarPreview({
  title,
  subtitle,
  start,
  end,
  progress,
  onOpen,
  openLabel,
}: {
  title: string;
  subtitle?: string;
  start: Date;
  end: Date;
  progress: number;
  onOpen?: () => void;
  openLabel?: string;
}) {
  return (
    <div className="space-y-2.5">
      <div>
        <p className="text-sm font-semibold leading-tight">{title}</p>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      <p className="text-xs text-muted-foreground">
        {format(start, 'd MMM')} – {format(end, 'd MMM yyyy')}
      </p>
      <div>
        <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary" style={{ width: `${progress}%` }} />
        </div>
      </div>
      {onOpen && (
        <button
          type="button"
          onClick={onOpen}
          className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {openLabel ?? 'Open'}
        </button>
      )}
    </div>
  );
}

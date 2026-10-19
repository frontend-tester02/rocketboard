'use client';

import { ProjectStatus, type ProjectDto, type TaskDto } from '@rocket/shared';
import { format } from 'date-fns';
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  DollarSign,
  ListTodo,
  Pencil,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/common/page-header';
import { StatusBadge, type StatusVariant } from '@/components/common/status-badge';
import { Button } from '@/components/ui/button';
import { AddProjectModal } from '@/features/projects/components/add-project-modal';
import { useProject } from '@/features/projects/hooks';
import { BoardView } from '@/features/tasks/components/board-view';
import { TaskDetailsModal } from '@/features/tasks/components/task-details-modal';
import { useBoard } from '@/features/tasks/hooks';
import { cn } from '@/lib/utils';

const statusMeta: Record<ProjectStatus, { variant: StatusVariant; label: string }> = {
  [ProjectStatus.Ongoing]: { variant: 'warning', label: 'Ongoing' },
  [ProjectStatus.Hold]: { variant: 'neutral', label: 'On Hold' },
  [ProjectStatus.Done]: { variant: 'success', label: 'Done' },
};

type TabKey = 'overview' | 'tasks' | 'files' | 'activity';
const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'Tasks' },
  { key: 'files', label: 'Files' },
  { key: 'activity', label: 'Activity' },
];

function initials(name: string) {
  const parts = name.replace(/@.*/, '').split(/[\s._-]+/).filter(Boolean);
  return (parts[0]?.[0] ?? '?').concat(parts[1]?.[0] ?? '').toUpperCase();
}

function StatCard({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: typeof ListTodo;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
      <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-lg', tint)}>
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-lg font-semibold">{value}</p>
      </div>
    </div>
  );
}

export function ProjectDetailsClient({ id }: { id: string }) {
  const { data: project, isLoading } = useProject(id);
  const boardQuery = useBoard(project?.board ?? null);
  const board = boardQuery.data;

  const [tab, setTab] = useState<TabKey>('overview');
  const [editing, setEditing] = useState(false);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const openTask = board?.tasks.find((t) => t.id === openTaskId) ?? null;

  const taskStats = useMemo(() => {
    if (!board) return { total: project?.taskCount ?? 0, done: 0, active: 0 };
    const doneColId = board.columns[board.columns.length - 1]?.id;
    const done = board.tasks.filter((t) => t.columnId === doneColId).length;
    return { total: board.tasks.length, done, active: board.tasks.length - done };
  }, [board, project?.taskCount]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (!project) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-danger">
        Project not found.
      </div>
    );
  }

  const color = project.coverColor || '#3E4DF5';
  const meta = statusMeta[project.status];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/projects"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to projects
      </Link>

      {/* Header */}
      <PageHeader
        title={project.name}
        description={project.client}
        actions={
          <Button variant="outline" className="gap-1.5" onClick={() => setEditing(true)}>
            <Pencil className="size-4" />
            Edit
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
        {project.members.length > 0 && (
          <div className="flex -space-x-2">
            {project.members.slice(0, 5).map((m) => (
              <span
                key={m}
                title={m}
                className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground"
              >
                {initials(m)}
              </span>
            ))}
            {project.members.length > 5 && (
              <span className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
                +{project.members.length - 5}
              </span>
            )}
          </div>
        )}
        {project.tags.map((t) => (
          <span key={t} className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
            #{t}
          </span>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={ListTodo} label="Total tasks" value={String(taskStats.total)} tint="bg-primary/10 text-primary" />
        <StatCard icon={CheckCircle2} label="Completed" value={String(taskStats.done)} tint="bg-success/10 text-success" />
        <StatCard icon={CircleDashed} label="In progress" value={String(taskStats.active)} tint="bg-warning/15 text-warning" />
        <StatCard
          icon={DollarSign}
          label="Budget"
          value={project.budget != null ? `$${project.budget.toLocaleString()}` : '—'}
          tint="bg-muted text-foreground"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              '-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && <OverviewTab project={project} color={color} />}

      {tab === 'tasks' &&
        (boardQuery.isLoading ? (
          <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
            Loading board…
          </div>
        ) : board ? (
          <BoardView board={board} onOpenTask={(t: TaskDto) => setOpenTaskId(t.id)} />
        ) : (
          <EmptyState text="No board linked to this project." />
        ))}

      {tab === 'files' && <EmptyState text="No files yet." />}
      {tab === 'activity' && <EmptyState text="No activity yet." />}

      <AddProjectModal project={editing ? project : null} open={editing} onOpenChange={setEditing} />

      {openTask && board && (
        <TaskDetailsModal
          task={openTask}
          boardId={board.id}
          open={openTaskId !== null}
          onOpenChange={(o) => !o && setOpenTaskId(null)}
        />
      )}
    </div>
  );
}

function OverviewTab({ project, color }: { project: ProjectDto; color: string }) {
  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">
        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold">Description</h2>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {project.description || 'No description provided.'}
          </p>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold">Progress</span>
            <span className="font-medium text-muted-foreground">{project.progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: color }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold">Details</h2>
        <dl className="space-y-3 text-sm">
          <DetailRow label="Client" value={project.client || '—'} />
          <DetailRow
            label="Start date"
            value={project.startDate ? format(new Date(project.startDate), 'd MMM yyyy') : '—'}
            icon={CalendarDays}
          />
          <DetailRow
            label="End date"
            value={project.endDate ? format(new Date(project.endDate), 'd MMM yyyy') : '—'}
            icon={CalendarDays}
          />
          <DetailRow
            label="Budget"
            value={project.budget != null ? `$${project.budget.toLocaleString()}` : '—'}
          />
        </dl>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: typeof CalendarDays;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="inline-flex items-center gap-1.5 font-medium">
        {Icon && <Icon className="size-3.5 text-muted-foreground" />}
        {value}
      </dd>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
      {text}
    </div>
  );
}

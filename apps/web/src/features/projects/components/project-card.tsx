'use client';

import { ProjectStatus, type ProjectDto } from '@rocket/shared';
import { format } from 'date-fns';
import { CalendarDays, FolderKanban, ListChecks, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { StatusBadge, type StatusVariant } from '@/components/common/status-badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const statusMeta: Record<ProjectStatus, { variant: StatusVariant; label: string }> = {
  [ProjectStatus.Ongoing]: { variant: 'warning', label: 'Ongoing' },
  [ProjectStatus.Hold]: { variant: 'neutral', label: 'On Hold' },
  [ProjectStatus.Done]: { variant: 'success', label: 'Done' },
};

export function ProjectCard({
  project,
  onOpen,
  onEdit,
  onDelete,
}: {
  project: ProjectDto;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const color = project.coverColor || '#3E4DF5';
  const meta = statusMeta[project.status];

  return (
    <div className="flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md" onClick={onOpen}>
      <div className="h-1.5 w-full" style={{ background: color }} />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: color }}>
            <FolderKanban className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{project.name}</p>
            {project.client && <p className="truncate text-xs text-muted-foreground">{project.client}</p>}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              onClick={(e) => e.stopPropagation()}
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground"
              aria-label="Project actions"
            >
              <MoreHorizontal className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              <DropdownMenuItem onSelect={onEdit}>
                <Pencil className="size-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="text-danger focus:text-danger" onSelect={onDelete}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {project.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{project.description}</p>
        )}

        {/* Progress */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full" style={{ width: `${project.progress}%`, background: color }} />
          </div>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          <StatusBadge variant={meta.variant}>{meta.label}</StatusBadge>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ListChecks className="size-3.5" />
              {project.taskCount}
            </span>
            {project.endDate && (
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="size-3.5" />
                {format(new Date(project.endDate), 'd MMM')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ProjectStatus, type ProjectDto } from '@rocket/shared';
import { format } from 'date-fns';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
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

export function ProjectsList({
  projects,
  onOpen,
  onEdit,
  onDelete,
}: {
  projects: ProjectDto[];
  onOpen: (p: ProjectDto) => void;
  onEdit: (p: ProjectDto) => void;
  onDelete: (p: ProjectDto) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-muted/40 text-left text-xs text-muted-foreground">
            <th className="px-4 py-2.5 font-medium">Project</th>
            <th className="px-4 py-2.5 font-medium">Client</th>
            <th className="px-4 py-2.5 font-medium">Progress</th>
            <th className="px-4 py-2.5 font-medium">Deadline</th>
            <th className="px-4 py-2.5 font-medium">Status</th>
            <th className="px-4 py-2.5" />
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => {
            const color = p.coverColor || '#3E4DF5';
            const meta = statusMeta[p.status];
            return (
              <tr key={p.id} className="cursor-pointer border-b border-border/60 last:border-0 hover:bg-accent/40" onClick={() => onOpen(p)}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="size-2.5 rounded-full" style={{ background: color }} />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.client ?? '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: color }} />
                    </div>
                    <span className="text-xs text-muted-foreground">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {p.endDate ? format(new Date(p.endDate), 'd MMM yyyy') : '—'}
                </td>
                <td className="px-4 py-3"><StatusBadge variant={meta.variant}>{meta.label}</StatusBadge></td>
                <td className="px-4 py-3 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger onClick={(e) => e.stopPropagation()} className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-accent hover:text-foreground" aria-label="Actions">
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                      <DropdownMenuItem onSelect={() => onEdit(p)}><Pencil className="size-4" />Edit</DropdownMenuItem>
                      <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => onDelete(p)}><Trash2 className="size-4" />Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

'use client';

import type { TaskDto } from '@rocket/shared';
import { format } from 'date-fns';
import { CalendarDays, MessageSquare, Paperclip } from 'lucide-react';
import { labelHex } from '@/features/tasks/task-meta';
import { cn } from '@/lib/utils';

export function TaskCard({ task, onClick }: { task: TaskDto; onClick?: () => void }) {
  const total = task.checklist.length;
  const doneCount = task.checklist.filter((c) => c.done).length;
  const pct = total ? Math.round((doneCount / total) * 100) : 0;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-xl border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {/* label dashes + date */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-1 pt-1">
          {task.labels.map((l) => (
            <span
              key={l}
              className="h-1 w-5 rounded-full"
              style={{ background: labelHex(l) }}
              title={l}
            />
          ))}
        </div>
        {task.dueDate && (
          <span className="inline-flex shrink-0 items-center gap-1 text-[11px] text-muted-foreground">
            <CalendarDays className="size-3" />
            {format(new Date(task.dueDate), 'MMM d')}
          </span>
        )}
      </div>

      {/* title + description */}
      <p className="mt-2 text-sm font-semibold leading-snug">{task.title}</p>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      {/* sub-tasks progress */}
      {total > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="font-medium">SUB-TASKS: {total}</span>
            <span>{pct}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}

      {/* cover image */}
      {task.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={task.coverImage} alt="" className="mt-3 h-28 w-full rounded-lg object-cover" />
      )}

      {/* footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3.5" />
              {task.attachments.length}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
            0
          </span>
        </div>
        {task.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className={cn(
                  'flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card',
                )}
                style={{ background: labelHex(a) }}
              >
                {a.slice(-2).toUpperCase()}
              </span>
            ))}
            {task.assignees.length > 3 && (
              <span className="flex size-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground ring-2 ring-card">
                +{task.assignees.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

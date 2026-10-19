'use client';

import type { TaskDto } from '@rocket/shared';
import { format } from 'date-fns';
import { CalendarDays, CheckSquare, MessageSquare, Paperclip } from 'lucide-react';
import { labelColor, priorityMeta } from '@/features/tasks/task-meta';
import { cn } from '@/lib/utils';

export function TaskCard({ task, onClick }: { task: TaskDto; onClick?: () => void }) {
  const pri = priorityMeta[task.priority];
  const doneCount = task.checklist.filter((c) => c.done).length;

  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-lg border border-border/60 bg-card p-3 shadow-sm transition-shadow hover:shadow-md"
    >
      {task.coverImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={task.coverImage} alt="" className="mb-2 h-24 w-full rounded-md object-cover" />
      )}

      {task.labels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {task.labels.map((l) => (
            <span key={l} className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', labelColor(l))}>
              {l}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-start gap-2">
        <span className={cn('mt-1 h-3.5 w-1 shrink-0 rounded-full', pri.bar)} />
        <p className="text-sm font-medium leading-snug">{task.title}</p>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {task.dueDate && (
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" />
              {format(new Date(task.dueDate), 'd MMM')}
            </span>
          )}
          {task.checklist.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <CheckSquare className="size-3.5" />
              {doneCount}/{task.checklist.length}
            </span>
          )}
          {task.attachments.length > 0 && (
            <span className="inline-flex items-center gap-1">
              <Paperclip className="size-3.5" />
              {task.attachments.length}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5" />
          </span>
        </div>
        {task.assignees.length > 0 && (
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((a, i) => (
              <span
                key={i}
                className="flex size-6 items-center justify-center rounded-full bg-primary/15 text-[10px] font-semibold text-primary ring-2 ring-card"
              >
                {a.slice(-2).toUpperCase()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

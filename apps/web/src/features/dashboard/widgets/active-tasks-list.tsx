'use client';

import { useState } from 'react';
import { Card } from '@/components/common/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  activeTasks,
  type TaskPeriod,
  type TaskPriority,
} from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

const periods: { value: TaskPeriod; label: string }[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const priorityBar: Record<TaskPriority, string> = {
  high: 'bg-danger',
  medium: 'bg-warning',
  low: 'bg-success',
};

export function ActiveTasksList() {
  const [period, setPeriod] = useState<TaskPeriod>('day');
  const [done, setDone] = useState<Record<string, boolean>>({});

  const tasks = activeTasks[period];

  return (
    <Card
      title="Active Tasks"
      action={
        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
          {periods.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => setPeriod(p.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
                period === p.value
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      }
      bodyClassName="flex flex-col gap-2"
    >
      {tasks.map((task) => {
        const checked = done[task.id] ?? task.done;
        return (
          <label
            key={task.id}
            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/60 py-2.5 pr-3"
          >
            <span
              className={cn('h-9 w-1 rounded-r-full', priorityBar[task.priority])}
            />
            <Checkbox
              checked={checked}
              onCheckedChange={(v) =>
                setDone((prev) => ({ ...prev, [task.id]: v === true }))
              }
            />
            <span
              className={cn(
                'flex-1 text-sm',
                checked && 'text-muted-foreground line-through',
              )}
            >
              {task.title}
            </span>
            <span className="shrink-0 text-xs text-muted-foreground">
              {task.time}
            </span>
          </label>
        );
      })}
    </Card>
  );
}

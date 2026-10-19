'use client';

import { TaskPriority } from '@rocket/shared';
import { SlidersHorizontal } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTaskLabels } from '@/features/tasks/hooks';
import { cn } from '@/lib/utils';

export interface BoardFilterValues {
  search?: string;
  priority?: string;
  label?: string;
  due?: string;
}

const ALL = '__all__';
const labelClass = 'text-xs font-medium text-muted-foreground';

export function BoardFilter({
  value,
  onChange,
  activeCount,
}: {
  value: BoardFilterValues;
  onChange: (updates: Partial<BoardFilterValues>) => void;
  activeCount: number;
}) {
  const labelsQuery = useTaskLabels();

  return (
    <Popover>
      <PopoverTrigger className="relative inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
        <SlidersHorizontal className="size-4" />
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Filter tasks</p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={() => onChange({ search: undefined, priority: undefined, label: undefined, due: undefined })}
              className="text-xs font-medium text-primary hover:text-primary/80"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="flex flex-col gap-3.5 px-4 py-3.5">
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Priority</Label>
            <Select value={value.priority ?? ALL} onValueChange={(v) => onChange({ priority: v === ALL ? undefined : v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All priorities</SelectItem>
                <SelectItem value={TaskPriority.Urgent}>Urgent</SelectItem>
                <SelectItem value={TaskPriority.High}>High</SelectItem>
                <SelectItem value={TaskPriority.Medium}>Medium</SelectItem>
                <SelectItem value={TaskPriority.Low}>Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Label</Label>
            <Select value={value.label ?? ALL} onValueChange={(v) => onChange({ label: v === ALL ? undefined : v })}>
              <SelectTrigger className="h-9"><SelectValue placeholder="All labels" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All labels</SelectItem>
                {labelsQuery.data?.map((l) => (
                  <SelectItem key={l.id} value={l.name}>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: l.color }} />
                      {l.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Due date</Label>
            <Select value={value.due ?? ALL} onValueChange={(v) => onChange({ due: v === ALL ? undefined : v })}>
              <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Any time</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="today">Due today</SelectItem>
                <SelectItem value="week">Due this week</SelectItem>
                <SelectItem value="none">No due date</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function matchesFilter(
  task: { priority: string; labels: string[]; dueDate?: string; title: string },
  f: BoardFilterValues,
): boolean {
  if (f.search && !task.title.toLowerCase().includes(f.search.toLowerCase())) return false;
  if (f.priority && task.priority !== f.priority) return false;
  if (f.label && !task.labels.includes(f.label)) return false;
  if (f.due) {
    const now = new Date();
    const due = task.dueDate ? new Date(task.dueDate) : null;
    if (f.due === 'none') {
      if (due) return false;
    } else if (!due) {
      return false;
    } else if (f.due === 'overdue') {
      if (due >= now) return false;
    } else if (f.due === 'today') {
      if (due.toDateString() !== now.toDateString()) return false;
    } else if (f.due === 'week') {
      const weekAhead = new Date(now);
      weekAhead.setDate(now.getDate() + 7);
      if (due < now || due > weekAhead) return false;
    }
  }
  return true;
}

export function activeFilterCount(f: BoardFilterValues): number {
  return [f.priority, f.label, f.due].filter(Boolean).length;
}

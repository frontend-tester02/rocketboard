'use client';

import type { BoardColumn, BoardWithTasks, TaskDto } from '@rocket/shared';
import { format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useMoveTask, useUpdateTask } from '@/features/tasks/hooks';
import { labelHex, priorityMeta } from '@/features/tasks/task-meta';
import { cn } from '@/lib/utils';

export function TaskListView({
  board,
  filter,
  onOpenTask,
}: {
  board: BoardWithTasks;
  filter?: (t: TaskDto) => boolean;
  onOpenTask?: (t: TaskDto) => void;
}) {
  const moveTask = useMoveTask(board.id);
  const updateTask = useUpdateTask(board.id);

  const columns = useMemo(
    () => [...board.columns].sort((a, b) => a.order - b.order),
    [board.columns],
  );
  const doneCol = columns[columns.length - 1];
  const todoCol = columns[0];

  const tasksByColumn = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    columns.forEach((c) => map.set(c.id, []));
    [...board.tasks]
      .filter((t) => (filter ? filter(t) : true))
      .sort((a, b) => a.order - b.order)
      .forEach((t) => map.get(t.columnId)?.push(t));
    return map;
  }, [board.tasks, columns, filter]);

  function toggleDone(task: TaskDto) {
    const target = task.columnId === doneCol?.id ? todoCol : doneCol;
    if (!target) return;
    const colTasks = board.tasks.filter((t) => t.columnId === target.id);
    const order = (Math.max(0, ...colTasks.map((t) => t.order)) || 0) + 1024;
    moveTask.mutate({ id: task.id, columnId: target.id, order });
  }

  return (
    <div className="flex flex-col gap-5">
      {columns.map((col) => {
        const tasks = tasksByColumn.get(col.id) ?? [];
        return (
          <div key={col.id} className="rounded-xl border border-border/60 bg-card">
            <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5">
              <span className="size-2.5 rounded-full" style={{ background: col.color || '#6B7280' }} />
              <h3 className="text-sm font-semibold">{col.title}</h3>
              <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{tasks.length}</span>
            </div>
            <div className="divide-y divide-border/60">
              {tasks.length === 0 ? (
                <p className="px-4 py-3 text-sm text-muted-foreground">No tasks.</p>
              ) : (
                tasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    done={col.id === doneCol?.id}
                    onToggle={() => toggleDone(task)}
                    onOpen={() => onOpenTask?.(task)}
                    onRename={(title) => updateTask.mutate({ id: task.id, input: { title } })}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TaskRow({
  task,
  done,
  onToggle,
  onOpen,
  onRename,
}: {
  task: TaskDto;
  done: boolean;
  onToggle: () => void;
  onOpen: () => void;
  onRename: (title: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const pri = priorityMeta[task.priority];

  function save() {
    const t = title.trim();
    if (t && t !== task.title) onRename(t);
    setEditing(false);
  }

  return (
    <div className="group flex items-center gap-3 px-4 py-2.5">
      <Checkbox checked={done} onCheckedChange={onToggle} className="rounded-full" />
      {editing ? (
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save();
            else if (e.key === 'Escape') { setTitle(task.title); setEditing(false); }
          }}
          className="min-w-0 flex-1 rounded border border-input bg-background px-1.5 py-0.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <button
          type="button"
          onClick={onOpen}
          onDoubleClick={(e) => { e.stopPropagation(); setTitle(task.title); setEditing(true); }}
          className={cn('min-w-0 flex-1 truncate text-left text-sm', done && 'text-muted-foreground line-through')}
        >
          {task.title}
        </button>
      )}

      {task.dueDate && (
        <span className="hidden shrink-0 items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
          <CalendarDays className="size-3.5" />
          {format(new Date(task.dueDate), 'MMM d')}
        </span>
      )}
      <span className={cn('size-2.5 shrink-0 rounded-full', pri.bar)} title={pri.label} />
      {task.assignees.length > 0 && (
        <div className="flex -space-x-2">
          {task.assignees.slice(0, 3).map((a, i) => (
            <span
              key={i}
              className="flex size-6 items-center justify-center rounded-full text-[10px] font-semibold text-white ring-2 ring-card"
              style={{ background: labelHex(a) }}
            >
              {a.slice(-2).toUpperCase()}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

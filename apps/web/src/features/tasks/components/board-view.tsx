'use client';

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { BoardColumn, BoardWithTasks, TaskDto } from '@rocket/shared';
import { Eraser, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TaskCard } from '@/features/tasks/components/task-card';
import {
  useAddColumn,
  useCreateTask,
  useDeleteTask,
  useMoveTask,
  useRemoveColumn,
  useUpdateColumn,
} from '@/features/tasks/hooks';
import { cn } from '@/lib/utils';

export function BoardView({
  board,
  onOpenTask,
}: {
  board: BoardWithTasks;
  onOpenTask?: (task: TaskDto) => void;
}) {
  const moveTask = useMoveTask(board.id);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const columns = useMemo(
    () => [...board.columns].sort((a, b) => a.order - b.order),
    [board.columns],
  );
  const tasksByColumn = useMemo(() => {
    const map = new Map<string, TaskDto[]>();
    columns.forEach((c) => map.set(c.id, []));
    [...board.tasks]
      .sort((a, b) => a.order - b.order)
      .forEach((t) => {
        if (!map.has(t.columnId)) map.set(t.columnId, []);
        map.get(t.columnId)!.push(t);
      });
    return map;
  }, [board.tasks, columns]);

  function onDragEnd(e: DragEndEvent) {
    const taskId = String(e.active.id);
    const overId = e.over ? String(e.over.id) : undefined;
    if (!overId) return;
    const task = board.tasks.find((t) => t.id === taskId);
    if (!task) return;

    let destCol: string;
    if (overId.startsWith('col:')) destCol = overId.slice(4);
    else {
      const overTask = board.tasks.find((t) => t.id === overId);
      if (!overTask) return;
      destCol = overTask.columnId;
    }

    const destTasks = (tasksByColumn.get(destCol) ?? []).filter((t) => t.id !== taskId);
    let index = destTasks.length;
    if (!overId.startsWith('col:')) {
      const i = destTasks.findIndex((t) => t.id === overId);
      if (i >= 0) index = i;
    }
    const before = destTasks[index - 1]?.order;
    const after = destTasks[index]?.order;
    let order: number;
    if (before == null && after == null) order = 1024;
    else if (before == null) order = after! - 1024;
    else if (after == null) order = before + 1024;
    else order = (before + after) / 2;

    if (task.columnId === destCol && task.order === order) return;
    moveTask.mutate({ id: taskId, columnId: destCol, order });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {columns.map((col) => (
          <Column
            key={col.id}
            board={board}
            column={col}
            tasks={tasksByColumn.get(col.id) ?? []}
            onOpenTask={onOpenTask}
          />
        ))}
        <AddColumn boardId={board.id} />
      </div>
    </DndContext>
  );
}

function AddColumn({ boardId }: { boardId: string }) {
  const addColumn = useAddColumn(boardId);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');

  function add() {
    const t = title.trim();
    if (!t) return;
    addColumn.mutate({ title: t }, { onSuccess: () => { setTitle(''); setAdding(false); } });
  }

  if (!adding) {
    return (
      <button
        type="button"
        onClick={() => setAdding(true)}
        className="flex h-fit w-64 shrink-0 items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
      >
        <Plus className="size-4" />
        Add column
      </button>
    );
  }
  return (
    <div className="w-64 shrink-0 rounded-xl bg-muted/40 p-2">
      <input
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') add();
          else if (e.key === 'Escape') { setAdding(false); setTitle(''); }
        }}
        placeholder="Column title…"
        className="h-9 w-full rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="mt-2 flex gap-2">
        <button type="button" onClick={add} className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
          Add
        </button>
        <button type="button" onClick={() => { setAdding(false); setTitle(''); }} className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Column({
  board,
  column,
  tasks,
  onOpenTask,
}: {
  board: BoardWithTasks;
  column: BoardColumn;
  tasks: TaskDto[];
  onOpenTask?: (task: TaskDto) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${column.id}` });
  const createTask = useCreateTask(board.id);
  const updateColumn = useUpdateColumn(board.id);
  const removeColumn = useRemoveColumn(board.id);
  const deleteTask = useDeleteTask(board.id);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [colName, setColName] = useState(column.title);

  function saveRename() {
    const name = colName.trim();
    if (name && name !== column.title) {
      updateColumn.mutate({ columnId: column.id, input: { title: name } });
    }
    setRenaming(false);
  }

  function clearColumn() {
    tasks.forEach((t) => deleteTask.mutate(t.id));
  }

  function add() {
    const t = title.trim();
    if (!t) return;
    createTask.mutate(
      { board: board.id, columnId: column.id, title: t },
      { onSuccess: () => setTitle('') },
    );
  }

  return (
    <div className="flex w-72 shrink-0 flex-col rounded-xl bg-muted/40 p-2">
      <div className="flex items-center gap-2 px-2 py-1.5">
        {column.color && <span className="size-2.5 rounded-full" style={{ background: column.color }} />}
        {renaming ? (
          <input
            autoFocus
            value={colName}
            onChange={(e) => setColName(e.target.value)}
            onBlur={saveRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') saveRename();
              else if (e.key === 'Escape') { setColName(column.title); setRenaming(false); }
            }}
            className="h-6 min-w-0 flex-1 rounded border border-input bg-background px-1.5 text-sm font-semibold outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        ) : (
          <h3 className="text-sm font-semibold">{column.title}</h3>
        )}
        <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{tasks.length}</span>
        <button
          type="button"
          onClick={() => setAdding((a) => !a)}
          className="ml-auto inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Add task"
        >
          <Plus className="size-4" />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex size-6 items-center justify-center rounded text-muted-foreground outline-none hover:bg-accent hover:text-foreground"
            aria-label="Column options"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => { setColName(column.title); setRenaming(true); }}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={clearColumn} disabled={tasks.length === 0}>
              <Eraser className="size-4" />
              Clear tasks
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-danger focus:text-danger"
              onSelect={() => removeColumn.mutate(column.id)}
            >
              <Trash2 className="size-4" />
              Delete column
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex min-h-16 flex-col gap-2 rounded-lg p-1 transition-colors',
          isOver && 'bg-primary/5',
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} onOpenTask={onOpenTask} />
          ))}
        </SortableContext>

        {adding && (
          <div className="rounded-lg border border-border/60 bg-card p-2">
            <textarea
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  add();
                } else if (e.key === 'Escape') {
                  setAdding(false);
                  setTitle('');
                }
              }}
              placeholder="Task title…"
              rows={2}
              className="w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="mt-1 flex gap-2">
              <button
                type="button"
                onClick={add}
                className="rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setAdding(false);
                  setTitle('');
                }}
                className="rounded-md px-2.5 py-1 text-xs text-muted-foreground hover:bg-accent"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {!adding && (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Plus className="size-4" />
          Add task
        </button>
      )}
    </div>
  );
}

function SortableTask({ task, onOpenTask }: { task: TaskDto; onOpenTask?: (t: TaskDto) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(isDragging && 'opacity-50')}
      {...attributes}
      {...listeners}
    >
      <TaskCard task={task} onClick={() => onOpenTask?.(task)} />
    </div>
  );
}

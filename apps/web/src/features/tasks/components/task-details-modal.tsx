'use client';

import type { ChecklistItem, TaskDto } from '@rocket/shared';
import { TaskPriority } from '@rocket/shared';
import { format } from 'date-fns';
import {
  CalendarDays,
  Check,
  Loader2,
  Paperclip,
  Plus,
  Tag,
  UserPlus,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { Textarea } from '@/components/ui/textarea';
import { SearchInput } from '@/components/common/search-input';
import { searchUsers } from '@/features/chat/api';
import { useQuery } from '@tanstack/react-query';
import {
  useAddComment,
  useComments,
  useCreateTaskLabel,
  useTaskLabels,
  useUpdateTask,
} from '@/features/tasks/hooks';
import { labelHex } from '@/features/tasks/task-meta';
import { uploadImage } from '@/features/uploads/api';
import { useMe } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

function uid() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

export function TaskDetailsModal({
  task,
  boardId,
  open,
  onOpenChange,
}: {
  task: TaskDto;
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const update = useUpdateTask(boardId);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const [newItem, setNewItem] = useState('');
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
  }, [task.id, task.title, task.description]);

  function patch(input: Parameters<typeof update.mutate>[0]['input']) {
    update.mutate({ id: task.id, input });
  }

  const checklist = task.checklist ?? [];
  const doneCount = checklist.filter((c) => c.done).length;
  const pct = checklist.length ? Math.round((doneCount / checklist.length) * 100) : 0;

  function setChecklist(next: ChecklistItem[]) {
    patch({ checklist: next });
  }

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      patch({ attachments: [...task.attachments, { name: file.name, url: res.url, size: file.size }] });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="flex-row items-center gap-2 border-b border-border px-5 py-3">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', priorityPill(task.priority))}>
            {task.priority}
          </span>
          <DialogTitle className="sr-only">Task details</DialogTitle>
        </DialogHeader>

        <div className="grid max-h-[75vh] grid-cols-1 overflow-y-auto lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-5 px-5 py-4 lg:col-span-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => title.trim() && title !== task.title && patch({ title: title.trim() })}
              className="w-full rounded-md bg-transparent text-lg font-semibold outline-none focus:bg-accent/40 focus:px-2"
            />

            {/* Description */}
            <Section title="Description">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={() => description !== (task.description ?? '') && patch({ description })}
                rows={3}
                placeholder="Add a description…"
              />
            </Section>

            {/* Checklist */}
            <Section title={`Checklist (${pct}%)`}>
              {checklist.length > 0 && (
                <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                {checklist.map((item) => (
                  <div key={item.id} className="group flex items-center gap-2.5">
                    <Checkbox
                      checked={item.done}
                      onCheckedChange={(v) =>
                        setChecklist(checklist.map((c) => (c.id === item.id ? { ...c, done: v === true } : c)))
                      }
                    />
                    <span className={cn('flex-1 text-sm', item.done && 'text-muted-foreground line-through')}>
                      {item.text}
                    </span>
                    <button
                      type="button"
                      onClick={() => setChecklist(checklist.filter((c) => c.id !== item.id))}
                      className="text-muted-foreground opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                      aria-label="Remove item"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newItem.trim()) {
                      setChecklist([...checklist, { id: uid(), text: newItem.trim(), done: false }]);
                      setNewItem('');
                    }
                  }}
                  placeholder="Add checklist item…"
                  className="h-8 flex-1 rounded-md border border-input bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </Section>

            {/* Attachments */}
            <Section title="Attachments">
              <div className="flex flex-col gap-2">
                {task.attachments.map((a) => (
                  <div key={a.url} className="flex items-center gap-2 rounded-lg border border-border/60 p-2 text-sm">
                    <Paperclip className="size-4 text-muted-foreground" />
                    <a href={a.url} target="_blank" rel="noreferrer" className="flex-1 truncate hover:underline">
                      {a.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => patch({ attachments: task.attachments.filter((x) => x.url !== a.url) })}
                      className="text-muted-foreground hover:text-danger"
                      aria-label="Remove"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80"
              >
                {uploading ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />}
                Add attachment
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload} />
            </Section>

            {/* Comments */}
            <Comments taskId={task.id} comment={comment} setComment={setComment} />
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-5 border-t border-border px-5 py-4 lg:border-l lg:border-t-0">
            <Meta title="Assigned to">
              <div className="flex flex-wrap items-center gap-1.5">
                {task.assignees.map((a) => (
                  <span
                    key={a}
                    className="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold text-white"
                    style={{ background: labelHex(a) }}
                  >
                    {a.slice(-2).toUpperCase()}
                  </span>
                ))}
                <AssignPopover
                  selected={task.assignees}
                  onToggle={(id) =>
                    patch({
                      assignees: task.assignees.includes(id)
                        ? task.assignees.filter((x) => x !== id)
                        : [...task.assignees, id],
                    })
                  }
                />
              </div>
            </Meta>

            <Meta title="Labels">
              <div className="flex flex-wrap items-center gap-1.5">
                {task.labels.map((l) => (
                  <span
                    key={l}
                    className="rounded px-2 py-0.5 text-xs font-medium text-white"
                    style={{ background: labelHex(l) }}
                  >
                    {l}
                  </span>
                ))}
                <LabelsPopover
                  selected={task.labels}
                  onToggle={(name) =>
                    patch({
                      labels: task.labels.includes(name)
                        ? task.labels.filter((x) => x !== name)
                        : [...task.labels, name],
                    })
                  }
                />
              </div>
            </Meta>

            <Meta title="Due date">
              <Popover>
                <PopoverTrigger className="inline-flex h-9 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm hover:bg-accent/40">
                  <CalendarDays className="size-4 text-muted-foreground" />
                  {task.dueDate ? format(new Date(task.dueDate), 'd MMM yyyy') : 'Set due date'}
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-2">
                  <Calendar
                    mode="single"
                    selected={task.dueDate ? new Date(task.dueDate) : undefined}
                    onSelect={(d) => patch({ dueDate: d ?? null })}
                  />
                </PopoverContent>
              </Popover>
            </Meta>

            <Meta title="Priority">
              <Select value={task.priority} onValueChange={(v) => patch({ priority: v as TaskPriority })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TaskPriority.Urgent}>Urgent</SelectItem>
                  <SelectItem value={TaskPriority.High}>High</SelectItem>
                  <SelectItem value={TaskPriority.Medium}>Medium</SelectItem>
                  <SelectItem value={TaskPriority.Low}>Low</SelectItem>
                </SelectContent>
              </Select>
            </Meta>

            <div className="mt-auto flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDescription('');
                  setNewItem('');
                  setComment('');
                  patch({
                    description: '',
                    checklist: [],
                    labels: [],
                    assignees: [],
                    dueDate: null,
                    attachments: [],
                    priority: TaskPriority.Medium,
                  });
                }}
                className="flex-1 rounded-md border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function priorityPill(p: TaskPriority): string {
  return {
    [TaskPriority.Low]: 'bg-muted text-muted-foreground',
    [TaskPriority.Medium]: 'bg-primary/10 text-primary',
    [TaskPriority.High]: 'bg-warning/15 text-warning',
    [TaskPriority.Urgent]: 'bg-danger/10 text-danger',
  }[p];
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}
function Meta({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      {children}
    </div>
  );
}

const LABEL_COLORS = ['#3E4DF5', '#F59E0B', '#22C55E', '#EF4444', '#A855F7', '#06B6D4'];

function LabelsPopover({ selected, onToggle }: { selected: string[]; onToggle: (name: string) => void }) {
  const labelsQuery = useTaskLabels();
  const createLabel = useCreateTaskLabel();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(LABEL_COLORS[0]!);

  function create() {
    const n = name.trim();
    if (!n) return;
    createLabel.mutate(
      { name: n, color },
      {
        onSuccess: () => {
          onToggle(n);
          setName('');
          setCreating(false);
        },
      },
    );
  }

  return (
    <Popover>
      <PopoverTrigger className="inline-flex size-6 items-center justify-center rounded-md border border-dashed border-border text-muted-foreground hover:text-foreground">
        <Plus className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <div className="max-h-48 overflow-y-auto">
          {labelsQuery.data?.length ? (
            labelsQuery.data.map((l) => {
              const on = selected.includes(l.name);
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onToggle(l.name)}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                >
                  <span className="size-2.5 rounded-full" style={{ background: l.color }} />
                  <span className="flex-1 text-left">{l.name}</span>
                  {on && <Check className="size-4 text-primary" />}
                </button>
              );
            })
          ) : (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              <Tag className="mr-1 inline size-3" />
              No labels yet
            </p>
          )}
        </div>

        {creating ? (
          <div className="mt-2 border-t border-border pt-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && create()}
              placeholder="Label name"
              className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex items-center gap-1.5">
              {LABEL_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn('size-5 rounded-full', color === c && 'ring-2 ring-offset-1 ring-offset-popover')}
                  style={{ background: c, ...(color === c ? { ['--tw-ring-color' as string]: c } : {}) }}
                  aria-label={`Color ${c}`}
                />
              ))}
              <button
                type="button"
                onClick={create}
                className="ml-auto rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="mt-1 flex w-full items-center gap-1.5 rounded-md border-t border-border px-2 pt-2 text-sm font-medium text-primary"
          >
            <Plus className="size-3.5" />
            Create new label
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

function AssignPopover({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const [term, setTerm] = useState('');
  const usersQuery = useQuery({
    queryKey: ['chat', 'users', term],
    queryFn: () => searchUsers(term || undefined),
  });
  return (
    <Popover>
      <PopoverTrigger className="inline-flex size-7 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground hover:text-foreground">
        <UserPlus className="size-3.5" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56 p-2">
        <SearchInput value={term} onChange={setTerm} placeholder="Find person…" className="mb-2 w-full" />
        <div className="max-h-56 overflow-y-auto">
          {usersQuery.data?.map((u) => {
            const on = selected.includes(u.id);
            return (
              <button
                key={u.id}
                type="button"
                onClick={() => onToggle(u.id)}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <UserAvatar name={`${u.firstName} ${u.lastName}`} src={u.avatar} className="size-7" />
                <span className="min-w-0 flex-1 truncate text-left">
                  {u.firstName} {u.lastName}
                </span>
                {on && <Check className="size-4 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function Comments({
  taskId,
  comment,
  setComment,
}: {
  taskId: string;
  comment: string;
  setComment: (v: string) => void;
}) {
  const { data: me } = useMe();
  const commentsQuery = useComments(taskId);
  const addComment = useAddComment(taskId);

  function submit() {
    const t = comment.trim();
    if (!t) return;
    addComment.mutate(t, { onSuccess: () => setComment('') });
  }

  return (
    <Section title="Comments">
      <div className="flex gap-2">
        <UserAvatar name={me ? `${me.firstName} ${me.lastName}` : 'Me'} src={me?.avatar} className="size-8" />
        <div className="flex-1">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder="Add a comment…"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!comment.trim() || addComment.isPending}
            className="mt-2 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Comment
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {commentsQuery.data?.map((c) => (
          <div key={c.id} className="flex gap-2">
            <UserAvatar name={`${c.author.firstName} ${c.author.lastName}`} src={c.author.avatar} className="size-8" />
            <div className="min-w-0">
              <p className="text-sm">
                <span className="font-medium">{c.author.firstName} {c.author.lastName}</span>{' '}
                {c.createdAt && (
                  <span className="text-xs text-muted-foreground">{format(new Date(c.createdAt), 'd MMM, HH:mm')}</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground">{c.text}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

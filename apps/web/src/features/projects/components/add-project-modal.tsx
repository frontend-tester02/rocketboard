'use client';

import { ProjectStatus, type ProjectDto } from '@rocket/shared';
import { Check, Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/features/products/components/tag-input';
import { useCreateProject, useUpdateProject } from '@/features/projects/hooks';
import { cn } from '@/lib/utils';

const COLORS = ['#3E4DF5', '#F59E0B', '#22C55E', '#EF4444', '#A855F7', '#06B6D4', '#EC4899', '#EAB308'];

function toDateInput(s?: string) {
  return s ? new Date(s).toISOString().slice(0, 10) : '';
}

export function AddProjectModal({
  project,
  open: controlledOpen,
  onOpenChange,
}: {
  project?: ProjectDto | null;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
} = {}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const isEdit = !!project;

  const createProject = useCreateProject();
  const updateProject = useUpdateProject();

  const [name, setName] = useState('');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<ProjectStatus>(ProjectStatus.Ongoing);
  const [color, setColor] = useState(COLORS[0]!);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  function setOpen(v: boolean) {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  }

  function reset() {
    setName(''); setClient(''); setDescription(''); setStatus(ProjectStatus.Ongoing);
    setColor(COLORS[0]!); setStartDate(''); setEndDate(''); setBudget(''); setTags([]); setError(null);
  }

  useEffect(() => {
    if (open && project) {
      setName(project.name);
      setClient(project.client ?? '');
      setDescription(project.description ?? '');
      setStatus(project.status);
      setColor(project.coverColor ?? COLORS[0]!);
      setStartDate(toDateInput(project.startDate));
      setEndDate(toDateInput(project.endDate));
      setBudget(project.budget != null ? String(project.budget) : '');
      setTags(project.tags ?? []);
      setError(null);
    }
  }, [open, project]);

  function submit() {
    if (!name.trim()) return setError('Name is required');
    const input = {
      name: name.trim(),
      client: client.trim() || undefined,
      description: description.trim() || undefined,
      status,
      coverColor: color,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      budget: budget.trim() ? Number(budget) : undefined,
      tags,
    };
    const onSuccess = () => { if (!isEdit) reset(); setOpen(false); };
    if (isEdit && project) updateProject.mutate({ id: project.id, input }, { onSuccess });
    else createProject.mutate(input, { onSuccess });
  }

  const pending = createProject.isPending || updateProject.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v && !isEdit) reset(); }}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button className="gap-1.5">
            <Plus className="size-4" />
            Add Project
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Project' : 'Add Project'}</DialogTitle>
        </DialogHeader>

        <div className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto p-1.5">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-name">Name</Label>
            <Input id="p-name" value={name} onChange={(e) => { setName(e.target.value); if (error) setError(null); }}
              placeholder="Design Plan" aria-invalid={!!error}
              className={cn(error && 'border-danger focus-visible:ring-danger')} />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-client">Client</Label>
              <Input id="p-client" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Acme Inc." />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ProjectStatus.Ongoing}>Ongoing</SelectItem>
                  <SelectItem value={ProjectStatus.Hold}>On Hold</SelectItem>
                  <SelectItem value={ProjectStatus.Done}>Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-desc">Description</Label>
            <Textarea id="p-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-start">Start date</Label>
              <Input id="p-start" type="date" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="p-end">End date</Label>
              <Input id="p-end" type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="p-budget">Budget ($)</Label>
            <Input id="p-budget" type="number" min={0} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="10000" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} aria-label={`Color ${c}`}
                  className={cn('flex size-7 items-center justify-center rounded-full', color === c && 'ring-2 ring-offset-2 ring-offset-card')}
                  style={{ background: c, ...(color === c ? { ['--tw-ring-color' as string]: c } : {}) }}>
                  {color === c && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Tags</Label>
            <TagInput value={tags} onChange={setTags} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit} disabled={pending} className="gap-1.5">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

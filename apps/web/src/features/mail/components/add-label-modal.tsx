'use client';

import type { MailLabelDto } from '@rocket/shared';
import { Check, Plus } from 'lucide-react';
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
import { useCreateLabel, useUpdateLabel } from '@/features/mail/hooks';
import { cn } from '@/lib/utils';

const COLORS = [
  '#3E4DF5', '#F7A35C', '#22C55E', '#EF4444',
  '#A855F7', '#EC4899', '#14B8A6', '#EAB308',
];

interface AddLabelModalProps {
  label?: MailLabelDto | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddLabelModal({
  label,
  open: controlledOpen,
  onOpenChange,
}: AddLabelModalProps = {}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const isEdit = !!label;

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]!);
  const [error, setError] = useState<string | null>(null);
  const createLabel = useCreateLabel();
  const updateLabel = useUpdateLabel();

  function setOpen(v: boolean) {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  }

  function reset() {
    setName('');
    setColor(COLORS[0]!);
    setError(null);
  }

  useEffect(() => {
    if (open && label) {
      setName(label.name);
      setColor(label.color);
      setError(null);
    }
  }, [open, label]);

  function submit() {
    if (!name.trim()) return setError('Name is required');
    const onSuccess = () => {
      if (!isEdit) reset();
      setOpen(false);
    };
    if (isEdit && label) {
      updateLabel.mutate({ id: label.id, input: { name: name.trim(), color } }, { onSuccess });
    } else {
      createLabel.mutate({ name: name.trim(), color }, { onSuccess });
    }
  }

  const pending = createLabel.isPending || updateLabel.isPending;

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v && !isEdit) reset();
      }}
    >
      {!isControlled && (
        <DialogTrigger
          className="inline-flex size-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Add label"
        >
          <Plus className="size-4" />
        </DialogTrigger>
      )}

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Label' : 'Add Label'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="label-name">Name</Label>
            <Input
              id="label-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Work"
              aria-invalid={!!error}
              className={cn(error && 'border-danger focus-visible:ring-danger')}
            />
            {error && <p className="text-xs text-danger">{error}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Color ${c}`}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full transition-transform hover:scale-105',
                    color === c && 'ring-2 ring-offset-2 ring-offset-card',
                  )}
                  style={{ backgroundColor: c, ...(color === c ? { ['--tw-ring-color' as string]: c } : {}) }}
                >
                  {color === c && <Check className="size-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

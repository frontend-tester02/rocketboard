'use client';

import type { CalendarDto } from '@rocket/shared';
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
import { useCreateCalendar, useUpdateCalendar } from '@/features/calendar/hooks';
import { cn } from '@/lib/utils';

const COLORS = [
  '#3E4DF5', '#F7A35C', '#22C55E', '#EF4444',
  '#A855F7', '#EC4899', '#14B8A6', '#EAB308',
];

interface AddCalendarModalProps {
  /** When provided, the modal edits this calendar instead of creating. */
  calendar?: CalendarDto | null;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddCalendarModal({
  calendar,
  open: controlledOpen,
  onOpenChange,
}: AddCalendarModalProps = {}) {
  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? controlledOpen : internalOpen;
  const isEdit = !!calendar;

  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]!);
  const [error, setError] = useState<string | null>(null);
  const createCalendar = useCreateCalendar();
  const updateCalendar = useUpdateCalendar();

  function setOpen(v: boolean) {
    if (isControlled) onOpenChange?.(v);
    else setInternalOpen(v);
  }

  function reset() {
    setName('');
    setColor(COLORS[0]!);
    setError(null);
  }

  // Load the calendar into the form when the edit modal opens.
  useEffect(() => {
    if (open && calendar) {
      setName(calendar.name);
      setColor(calendar.color);
      setError(null);
    }
  }, [open, calendar]);

  function submit() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    const onSuccess = () => {
      if (!isEdit) reset();
      setOpen(false);
    };
    if (isEdit && calendar) {
      updateCalendar.mutate(
        { id: calendar.id, input: { name: name.trim(), color } },
        { onSuccess },
      );
    } else {
      createCalendar.mutate({ name: name.trim(), color }, { onSuccess });
    }
  }

  const pending = createCalendar.isPending || updateCalendar.isPending;

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
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Add calendar"
        >
          <Plus className="size-4" />
        </DialogTrigger>
      )}

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Calendar' : 'Add Calendar'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cal-name">Name</Label>
            <Input
              id="cal-name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g. Personal"
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
                  aria-label={`Select color ${c}`}
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

'use client';

import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
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
import { useCreateCalendar } from '@/features/calendar/hooks';
import { cn } from '@/lib/utils';

const COLORS = [
  '#3E4DF5', '#F7A35C', '#22C55E', '#EF4444',
  '#A855F7', '#EC4899', '#14B8A6', '#EAB308',
];

export function AddCalendarModal() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]!);
  const [error, setError] = useState<string | null>(null);
  const createCalendar = useCreateCalendar();

  function reset() {
    setName('');
    setColor(COLORS[0]!);
    setError(null);
  }

  function submit() {
    if (!name.trim()) {
      setError('Name is required');
      return;
    }
    createCalendar.mutate(
      { name: name.trim(), color },
      {
        onSuccess: () => {
          reset();
          setOpen(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger
        className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Add calendar"
      >
        <Plus className="size-4" />
      </DialogTrigger>

      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Add Calendar</DialogTitle>
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
          <Button onClick={submit} disabled={createCalendar.isPending}>
            Create
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

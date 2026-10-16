'use client';

import { format } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { TimeSelect } from '@/features/calendar/components/time-select';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  allDay?: boolean;
}

export function DateTimePicker({ value, onChange, allDay = false }: DateTimePickerProps) {
  const [open, setOpen] = useState(false);

  function pickDate(date: Date | undefined) {
    if (!date) return;
    const next = new Date(value);
    next.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    onChange(next);
    if (allDay) setOpen(false);
  }

  const label = allDay
    ? format(value, 'd MMM yyyy')
    : format(value, 'd MMM yyyy, HH:mm');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex h-10 w-full items-center gap-2 rounded-md border border-input bg-background px-3 text-left text-sm outline-none transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring"
      >
        <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="truncate">{label}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <div className="p-2">
          <Calendar mode="single" selected={value} onSelect={pickDate} defaultMonth={value} />
        </div>
        {!allDay && (
          <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <TimeSelect value={value} onChange={onChange} />
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

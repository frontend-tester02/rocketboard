'use client';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function label(range?: DateRange): string {
  if (!range?.from) return 'Pick a date range';
  if (!range.to) return format(range.from, 'd MMM yyyy');
  return `${format(range.from, 'd MMM')} – ${format(range.to, 'd MMM')}`;
}

/**
 * Date range picker rendered as a pill (e.g. "19 Aug – 25 Aug") that opens a
 * two-month range calendar.
 */
export function DateRangePicker({
  value,
  onChange,
  className,
}: {
  value?: DateRange;
  onChange?: (range: DateRange | undefined) => void;
  className?: string;
}) {
  const [internal, setInternal] = useState<DateRange | undefined>(value);
  const range = value ?? internal;

  function handleSelect(next: DateRange | undefined) {
    setInternal(next);
    onChange?.(next);
  }

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <CalendarIcon className="size-3.5" />
        {label(range)}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="end">
        <Calendar
          mode="range"
          numberOfMonths={2}
          defaultMonth={range?.from}
          selected={range}
          onSelect={handleSelect}
        />
      </PopoverContent>
    </Popover>
  );
}

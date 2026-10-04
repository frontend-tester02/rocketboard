'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export const periodOptions = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'year', label: 'This year' },
] as const;

export type Period = (typeof periodOptions)[number]['value'];

export function PeriodSelect({
  value = '7d',
  onChange,
  className,
}: {
  value?: Period;
  onChange?: (value: Period) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange?.(v as Period)}>
      <SelectTrigger
        className={cn(
          'h-9 w-auto gap-2 rounded-lg border-border/60 bg-background text-xs font-medium text-muted-foreground',
          className,
        )}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {periodOptions.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

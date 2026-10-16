'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface TimeSelectProps {
  value: Date;
  onChange: (date: Date) => void;
}

const hours12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,..,55

function pad(n: number) {
  return String(n).padStart(2, '0');
}

/** 12-hour time selector (hour · minute · AM/PM) bound to a Date. */
export function TimeSelect({ value, onChange }: TimeSelectProps) {
  const h24 = value.getHours();
  const meridiem = h24 >= 12 ? 'PM' : 'AM';
  const h12 = ((h24 + 11) % 12) + 1;
  const minute = value.getMinutes();
  // Snap an off-grid minute onto the options list so it still shows.
  const minuteOptions = minutes.includes(minute)
    ? minutes
    : [...minutes, minute].sort((a, b) => a - b);

  function apply(nextH12: number, nextMin: number, nextMer: 'AM' | 'PM') {
    let h = nextH12 % 12;
    if (nextMer === 'PM') h += 12;
    const next = new Date(value);
    next.setHours(h, nextMin, 0, 0);
    onChange(next);
  }

  return (
    <div className="flex items-center gap-1.5">
      <Select value={String(h12)} onValueChange={(v) => apply(Number(v), minute, meridiem)}>
        <SelectTrigger className="h-9 w-[4.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {hours12.map((h) => (
            <SelectItem key={h} value={String(h)}>
              {pad(h)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">:</span>
      <Select value={String(minute)} onValueChange={(v) => apply(h12, Number(v), meridiem)}>
        <SelectTrigger className="h-9 w-[4.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {minuteOptions.map((m) => (
            <SelectItem key={m} value={String(m)}>
              {pad(m)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={meridiem}
        onValueChange={(v) => apply(h12, minute, v as 'AM' | 'PM')}
      >
        <SelectTrigger className="h-9 w-[4.5rem]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

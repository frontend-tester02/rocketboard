'use client';

import type { CalendarDto, EventDto } from '@rocket/shared';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { DateTimePicker } from '@/features/calendar/components/date-time-picker';
import { TagInput } from '@/features/products/components/tag-input';
import { useCreateEvent, useUpdateEvent } from '@/features/calendar/hooks';
import { cn } from '@/lib/utils';

interface NewEventModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  calendars: CalendarDto[];
  defaultDate?: Date | null;
  /** When provided, the modal edits this event instead of creating. */
  event?: EventDto | null;
}

export function NewEventModal({
  open,
  onOpenChange,
  calendars,
  defaultDate,
  event,
}: NewEventModalProps) {
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const isEdit = !!event;

  const [title, setTitle] = useState('');
  const [calendar, setCalendar] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [start, setStart] = useState<Date>(new Date());
  const [end, setEnd] = useState<Date>(new Date());
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Seed the form each time the modal opens.
  useEffect(() => {
    if (!open) return;
    setError(null);
    if (event) {
      setTitle(event.title);
      setCalendar(event.calendar);
      setAllDay(event.allDay);
      setStart(new Date(event.start));
      setEnd(new Date(event.end));
      setLocation(event.location ?? '');
      setDescription(event.description ?? '');
      setAttendees(event.attendees ?? []);
      return;
    }
    const base = defaultDate ?? new Date();
    const s = new Date(base);
    if (!defaultDate) s.setMinutes(0, 0, 0);
    const e = new Date(s);
    e.setHours(s.getHours() + 1);
    setTitle('');
    setCalendar(calendars[0]?.id ?? '');
    setAllDay(false);
    setStart(s);
    setEnd(e);
    setLocation('');
    setDescription('');
    setAttendees([]);
  }, [open, defaultDate, calendars, event]);

  function submit() {
    if (!title.trim()) return setError('Title is required');
    if (!calendar) return setError('Select a calendar');
    if (end < start) return setError('End must be after start');

    const payload = {
      calendar,
      title: title.trim(),
      description: description.trim() || undefined,
      start,
      end,
      allDay,
      location: location.trim() || undefined,
      attendees,
    };
    const onSuccess = () => onOpenChange(false);
    if (isEdit && event) {
      updateEvent.mutate({ id: event.id, input: payload }, { onSuccess });
    } else {
      createEvent.mutate(payload, { onSuccess });
    }
  }

  const pending = createEvent.isPending || updateEvent.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Event' : 'New Event'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-title">Title</Label>
            <Input
              id="ev-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Team sync"
              aria-invalid={!!error && !title.trim()}
              className={cn(error && !title.trim() && 'border-danger focus-visible:ring-danger')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Calendar</Label>
            <Select value={calendar} onValueChange={setCalendar}>
              <SelectTrigger>
                <SelectValue placeholder="Select a calendar" />
              </SelectTrigger>
              <SelectContent>
                {calendars.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full" style={{ background: c.color }} />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox checked={allDay} onCheckedChange={(v) => setAllDay(v === true)} />
            All day
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>Start</Label>
              <DateTimePicker value={start} onChange={setStart} allDay={allDay} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>End</Label>
              <DateTimePicker value={end} onChange={setEnd} allDay={allDay} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-location">Location</Label>
            <Input
              id="ev-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Room 4B / Zoom"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="ev-desc">Description</Label>
            <Textarea
              id="ev-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda…"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>Attendees</Label>
            <TagInput value={attendees} onChange={setAttendees} placeholder="Add a name…" />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}
        </div>

        <div className="mt-2 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending} className="gap-1.5">
            {pending && <Loader2 className="size-4 animate-spin" />}
            {isEdit ? 'Save' : 'Create'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

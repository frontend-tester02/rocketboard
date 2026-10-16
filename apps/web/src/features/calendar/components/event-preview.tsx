'use client';

import type { EventDto } from '@rocket/shared';
import { format } from 'date-fns';
import { Clock, MapPin, Pencil, Trash2, Users } from 'lucide-react';

interface EventPreviewProps {
  event: EventDto;
  calendarName?: string;
  color: string;
  onEdit: () => void;
  onDelete: () => void;
}

function timeLabel(event: EventDto): string {
  const start = new Date(event.start);
  const end = new Date(event.end);
  if (event.allDay) return `${format(start, 'd MMM yyyy')} · All day`;
  const sameDay = start.toDateString() === end.toDateString();
  return sameDay
    ? `${format(start, 'd MMM yyyy')} · ${format(start, 'h:mm a')} – ${format(end, 'h:mm a')}`
    : `${format(start, 'd MMM, h:mm a')} – ${format(end, 'd MMM, h:mm a')}`;
}

export function EventPreview({
  event,
  calendarName,
  color,
  onEdit,
  onDelete,
}: EventPreviewProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2">
        <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: color }} />
        <div className="min-w-0 flex-1">
          <p className="font-semibold leading-tight">{event.title}</p>
          {calendarName && (
            <p className="text-xs text-muted-foreground">{calendarName}</p>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Clock className="mt-0.5 size-4 shrink-0" />
        <span>{timeLabel(event)}</span>
      </div>

      {event.location && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 size-4 shrink-0" />
          <span>{event.location}</span>
        </div>
      )}

      {event.attendees.length > 0 && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <Users className="mt-0.5 size-4 shrink-0" />
          <span>{event.attendees.join(', ')}</span>
        </div>
      )}

      {event.description && (
        <p className="text-sm text-muted-foreground">{event.description}</p>
      )}

      <div className="mt-1 flex items-center justify-end gap-1.5 border-t border-border pt-3">
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil className="size-3.5" />
          Edit
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
        >
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

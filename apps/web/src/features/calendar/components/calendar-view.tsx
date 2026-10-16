'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import type { CalendarDto } from '@rocket/shared';
import { MoreHorizontal, Palette, Pencil, Trash2 } from 'lucide-react';
import { useMemo, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { addMonths, format } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
} from '@/components/ui/popover';
import { AddCalendarModal } from '@/features/calendar/components/add-calendar-modal';
import { EventPreview } from '@/features/calendar/components/event-preview';
import { NewEventModal } from '@/features/calendar/components/new-event-modal';
import {
  useCalendars,
  useCreateEvent,
  useDeleteCalendar,
  useDeleteEvent,
  useEvents,
  useUpdateEvent,
} from '@/features/calendar/hooks';
import { cn } from '@/lib/utils';
import type { EventDto } from '@rocket/shared';
import { toast } from 'sonner';

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [miniDate, setMiniDate] = useState<Date | undefined>(new Date());
  const [miniMonth, setMiniMonth] = useState<Date>(new Date());
  const [hidden, setHidden] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<CalendarDto | null>(null);
  const [toDelete, setToDelete] = useState<CalendarDto | null>(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [newEventDate, setNewEventDate] = useState<Date | null>(null);
  const [preview, setPreview] = useState<EventDto | null>(null);
  const [previewPos, setPreviewPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [editingEvent, setEditingEvent] = useState<EventDto | null>(null);
  const [toDeleteEvent, setToDeleteEvent] = useState<EventDto | null>(null);

  const calendarsQuery = useCalendars();
  const deleteCalendar = useDeleteCalendar();
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();
  const createEvent = useCreateEvent();

  function confirmDeleteEvent() {
    const ev = toDeleteEvent;
    setToDeleteEvent(null);
    if (!ev) return;
    deleteEvent.mutate(ev.id, {
      onSuccess: () => {
        toast('Event deleted', {
          action: {
            label: 'Undo',
            onClick: () =>
              createEvent.mutate({
                calendar: ev.calendar,
                title: ev.title,
                description: ev.description,
                start: new Date(ev.start),
                end: new Date(ev.end),
                allDay: ev.allDay,
                location: ev.location,
                attendees: ev.attendees,
              }),
          },
        });
      },
    });
  }
  const eventsQuery = useEvents(range?.from ?? null, range?.to ?? null);

  const colorById = useMemo(() => {
    const map = new Map<string, string>();
    calendarsQuery.data?.forEach((c) => map.set(c.id, c.color));
    return map;
  }, [calendarsQuery.data]);

  const events = useMemo(() => {
    return (eventsQuery.data ?? [])
      .filter((e) => !hidden.has(e.calendar))
      .map((e) => {
        const color = e.color ?? colorById.get(e.calendar) ?? '#3E4DF5';
        return {
          id: e.id,
          title: e.title,
          start: e.start,
          end: e.end,
          allDay: e.allDay,
          backgroundColor: color,
          borderColor: color,
        };
      });
  }, [eventsQuery.data, hidden, colorById]);

  function toggleCalendar(id: string) {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function gotoDate(date: Date | undefined) {
    setMiniDate(date);
    if (date) {
      setMiniMonth(date);
      calendarRef.current?.getApi().gotoDate(date);
    }
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-72">
        <Button
          className="w-full gap-1.5"
          onClick={() => {
            setNewEventDate(null);
            setEventModalOpen(true);
          }}
        >
          <Plus className="size-4" />
          New Event
        </Button>

        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setMiniMonth((m) => addMonths(m, -1))}
              aria-label="Previous month"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span className="text-sm font-medium">{format(miniMonth, 'MMMM yyyy')}</span>
            <button
              type="button"
              onClick={() => setMiniMonth((m) => addMonths(m, 1))}
              aria-label="Next month"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <Calendar
            mode="single"
            month={miniMonth}
            onMonthChange={setMiniMonth}
            selected={miniDate}
            onSelect={gotoDate}
            className="w-full"
            classNames={{
              months: 'flex w-full flex-col gap-4',
              month: 'flex w-full flex-col gap-2',
              month_caption: 'hidden',
              nav: 'hidden',
              weekdays: 'flex w-full justify-between',
              week: 'mt-2 flex w-full justify-between',
            }}
          />
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">My Calendars</h3>
            <AddCalendarModal />
          </div>
          <div className="flex flex-col gap-2">
            {calendarsQuery.data?.map((c) => {
              const shown = !hidden.has(c.id);
              return (
                <div key={c.id} className="group flex items-center gap-2.5 text-sm">
                  <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={shown}
                      onChange={() => toggleCalendar(c.id)}
                      className="sr-only"
                    />
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                        shown ? 'border-transparent' : 'border-border bg-transparent',
                      )}
                      style={shown ? { backgroundColor: c.color } : undefined}
                    >
                      {shown && (
                        <svg viewBox="0 0 12 12" className="size-3 text-white" fill="none">
                          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className={cn('truncate', !shown && 'text-muted-foreground')}>
                      {c.name}
                    </span>
                  </label>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                      aria-label={`Options for ${c.name}`}
                    >
                      <MoreHorizontal className="size-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => setEditing(c)}>
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => setEditing(c)}>
                        <Palette className="size-4" />
                        Change color
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-danger focus:text-danger"
                        onSelect={() => setToDelete(c)}
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Event preview popover (anchored at the click point) */}
      <Popover open={preview !== null} onOpenChange={(o) => !o && setPreview(null)}>
        <PopoverAnchor asChild>
          <div
            className="pointer-events-none fixed"
            style={{ left: previewPos.x, top: previewPos.y }}
          />
        </PopoverAnchor>
        <PopoverContent align="start" className="w-72">
          {preview && (
            <EventPreview
              event={preview}
              calendarName={
                calendarsQuery.data?.find((c) => c.id === preview.calendar)?.name
              }
              color={colorById.get(preview.calendar) ?? '#3E4DF5'}
              onEdit={() => {
                setEditingEvent(preview);
                setPreview(null);
              }}
              onDelete={() => {
                setToDeleteEvent(preview);
                setPreview(null);
              }}
            />
          )}
        </PopoverContent>
      </Popover>

      {/* New / edit event */}
      <NewEventModal
        open={eventModalOpen}
        onOpenChange={setEventModalOpen}
        calendars={calendarsQuery.data ?? []}
        defaultDate={newEventDate}
      />
      <NewEventModal
        open={editingEvent !== null}
        onOpenChange={(o) => !o && setEditingEvent(null)}
        calendars={calendarsQuery.data ?? []}
        event={editingEvent}
      />

      {/* Edit calendar (controlled) */}
      <AddCalendarModal
        calendar={editing}
        open={editing !== null}
        onOpenChange={(o) => !o && setEditing(null)}
      />

      <ConfirmDialog
        open={toDeleteEvent !== null}
        onOpenChange={(o) => !o && setToDeleteEvent(null)}
        title="Delete event?"
        description={
          toDeleteEvent
            ? `“${toDeleteEvent.title}” will be removed. You can undo this.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDeleteEvent}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete calendar?"
        description={
          toDelete
            ? `“${toDelete.name}” and all its events will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (toDelete) {
            deleteCalendar.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
          }
        }}
      />

      {/* Calendar */}
      <div className="min-w-0 flex-1 overflow-x-auto rounded-xl border border-border/60 bg-card p-4 shadow-sm">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={events}
          datesSet={(info) => setRange({ from: info.startStr, to: info.endStr })}
          dateClick={(info) => {
            setNewEventDate(info.date);
            setEventModalOpen(true);
          }}
          eventClick={(info) => {
            info.jsEvent.preventDefault();
            const ev = eventsQuery.data?.find((e) => e.id === info.event.id);
            if (ev) {
              setPreviewPos({ x: info.jsEvent.clientX, y: info.jsEvent.clientY });
              setPreview(ev);
            }
          }}
          editable
          eventDrop={(info) => {
            const { start, end } = info.event;
            if (!start) return;
            updateEvent.mutate(
              { id: info.event.id, input: { start, end: end ?? start } },
              { onError: () => info.revert() },
            );
          }}
          eventResize={(info) => {
            const { start, end } = info.event;
            if (!start || !end) return;
            updateEvent.mutate(
              { id: info.event.id, input: { start, end } },
              { onError: () => info.revert() },
            );
          }}
          height="auto"
          dayMaxEvents={2}
          moreLinkClick="popover"
          moreLinkContent={(arg) => `+${arg.num} more`}
          nowIndicator
        />
      </div>
    </div>
  );
}

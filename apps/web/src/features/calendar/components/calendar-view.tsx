'use client';

import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import { useMemo, useRef, useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { useCalendars, useEvents } from '@/features/calendar/hooks';
import { cn } from '@/lib/utils';

export function CalendarView() {
  const calendarRef = useRef<FullCalendar>(null);
  const [range, setRange] = useState<{ from: string; to: string } | null>(null);
  const [miniDate, setMiniDate] = useState<Date | undefined>(new Date());
  const [hidden, setHidden] = useState<Set<string>>(new Set());

  const calendarsQuery = useCalendars();
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
    if (date) calendarRef.current?.getApi().gotoDate(date);
  }

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col gap-5 lg:w-72">
        <div className="rounded-xl border border-border/60 bg-card p-3 shadow-sm">
          <Calendar
            mode="single"
            selected={miniDate}
            onSelect={gotoDate}
            className="w-full"
            classNames={{
              months: 'flex w-full flex-col gap-4',
              month: 'flex w-full flex-col gap-4',
              weekdays: 'flex w-full justify-between',
              week: 'mt-2 flex w-full justify-between',
            }}
          />
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">My Calendars</h3>
          <div className="flex flex-col gap-2">
            {calendarsQuery.data?.map((c) => {
              const shown = !hidden.has(c.id);
              return (
                <label
                  key={c.id}
                  className="flex cursor-pointer items-center gap-2.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={shown}
                    onChange={() => toggleCalendar(c.id)}
                    className="sr-only"
                  />
                  <span
                    className={cn(
                      'flex size-4 items-center justify-center rounded border transition-colors',
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
                  <span className={cn(!shown && 'text-muted-foreground')}>{c.name}</span>
                </label>
              );
            })}
          </div>
        </div>
      </aside>

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
          height="auto"
          dayMaxEvents={3}
          nowIndicator
        />
      </div>
    </div>
  );
}

'use client';

import type { UpdateCalendar, UpdateEvent } from '@rocket/shared';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createCalendar,
  createEvent,
  deleteCalendar,
  deleteEvent,
  listCalendars,
  listEvents,
  updateCalendar,
  updateEvent,
} from '@/features/calendar/api';

export const calendarKeys = {
  calendars: ['calendars'] as const,
  events: (from: string, to: string) => ['events', from, to] as const,
};

export function useCalendars() {
  return useQuery({
    queryKey: calendarKeys.calendars,
    queryFn: listCalendars,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEvents(from: string | null, to: string | null) {
  return useQuery({
    queryKey: calendarKeys.events(from ?? '', to ?? ''),
    queryFn: () => listEvents(from!, to!),
    enabled: !!from && !!to,
    placeholderData: keepPreviousData,
  });
}

function useInvalidateCalendars() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: calendarKeys.calendars });
}

function useInvalidateEvents() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: ['events'] });
}

export function useCreateCalendar() {
  const invalidate = useInvalidateCalendars();
  return useMutation({
    mutationFn: createCalendar,
    onSuccess: () => {
      invalidate();
      toast.success('Calendar created');
    },
  });
}

export function useUpdateCalendar() {
  const invalidate = useInvalidateCalendars();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCalendar }) =>
      updateCalendar(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCalendar() {
  const invalidateCal = useInvalidateCalendars();
  const invalidateEv = useInvalidateEvents();
  return useMutation({
    mutationFn: deleteCalendar,
    onSuccess: () => {
      invalidateCal();
      invalidateEv();
      toast.success('Calendar deleted');
    },
  });
}

export function useCreateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      invalidate();
      toast.success('Event created');
    },
  });
}

export function useUpdateEvent() {
  const invalidate = useInvalidateEvents();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateEvent }) =>
      updateEvent(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteEvent() {
  const invalidate = useInvalidateEvents();
  // Toast (with Undo) is handled at the call site, not here.
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: invalidate,
  });
}

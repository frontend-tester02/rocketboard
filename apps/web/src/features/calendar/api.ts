import type {
  CalendarDto,
  CreateCalendarInput,
  CreateEventInput,
  EventDto,
  UpdateCalendar,
  UpdateEvent,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export async function listCalendars(): Promise<CalendarDto[]> {
  const { data } = await apiClient.get<Envelope<CalendarDto[]>>('/calendars');
  return data.data;
}

export async function createCalendar(
  input: CreateCalendarInput,
): Promise<CalendarDto> {
  const { data } = await apiClient.post<Envelope<CalendarDto>>('/calendars', input);
  return data.data;
}

export async function updateCalendar(
  id: string,
  input: UpdateCalendar,
): Promise<CalendarDto> {
  const { data } = await apiClient.patch<Envelope<CalendarDto>>(
    `/calendars/${id}`,
    input,
  );
  return data.data;
}

export async function deleteCalendar(id: string): Promise<void> {
  await apiClient.delete(`/calendars/${id}`);
}

export async function listEvents(
  from: string,
  to: string,
  calendarIds?: string[],
): Promise<EventDto[]> {
  const { data } = await apiClient.get<Envelope<EventDto[]>>('/events', {
    params: {
      from,
      to,
      ...(calendarIds?.length ? { calendarIds: calendarIds.join(',') } : {}),
    },
  });
  return data.data;
}

export async function createEvent(input: CreateEventInput): Promise<EventDto> {
  const { data } = await apiClient.post<Envelope<EventDto>>('/events', input);
  return data.data;
}

export async function updateEvent(
  id: string,
  input: UpdateEvent,
): Promise<EventDto> {
  const { data } = await apiClient.patch<Envelope<EventDto>>(`/events/${id}`, input);
  return data.data;
}

export async function deleteEvent(id: string): Promise<void> {
  await apiClient.delete(`/events/${id}`);
}

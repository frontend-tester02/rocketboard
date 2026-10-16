// Calendar + event contracts shared between web and api.
import { z } from 'zod';

export const createCalendarSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  color: z.string().trim().min(1).max(20),
  isVisible: z.boolean().optional().default(true),
  members: z.array(z.string().trim().min(1)).optional().default([]),
});
export type CreateCalendar = z.infer<typeof createCalendarSchema>;
export type CreateCalendarInput = z.input<typeof createCalendarSchema>;

export const updateCalendarSchema = createCalendarSchema.partial();
export type UpdateCalendar = z.infer<typeof updateCalendarSchema>;

export interface CalendarDto {
  id: string;
  owner: string;
  name: string;
  color: string;
  isVisible: boolean;
  members: string[];
  createdAt?: string;
  updatedAt?: string;
}

export const createEventSchema = z
  .object({
    calendar: z.string().trim().min(1, 'Calendar is required'),
    title: z.string().trim().min(1, 'Title is required').max(160),
    description: z.string().trim().max(2000).optional(),
    start: z.coerce.date(),
    end: z.coerce.date(),
    allDay: z.boolean().optional().default(false),
    location: z.string().trim().max(200).optional(),
    attendees: z.array(z.string().trim().min(1)).optional().default([]),
    reminder: z.number().int().min(0).optional(),
    color: z.string().trim().max(20).optional(),
  })
  .refine((d) => d.end >= d.start, {
    message: 'End must be after start',
    path: ['end'],
  });
export type CreateEvent = z.infer<typeof createEventSchema>;
export type CreateEventInput = z.input<typeof createEventSchema>;

export const updateEventSchema = z.object({
  calendar: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  start: z.coerce.date().optional(),
  end: z.coerce.date().optional(),
  allDay: z.boolean().optional(),
  location: z.string().trim().max(200).optional(),
  attendees: z.array(z.string().trim().min(1)).optional(),
  reminder: z.number().int().min(0).optional(),
  color: z.string().trim().max(20).optional(),
});
export type UpdateEvent = z.infer<typeof updateEventSchema>;

export const eventRangeQuerySchema = z.object({
  from: z.coerce.date(),
  to: z.coerce.date(),
  /** Comma-separated calendar ids to include. */
  calendarIds: z.string().trim().optional(),
});
export type EventRangeQuery = z.infer<typeof eventRangeQuerySchema>;

export interface EventDto {
  id: string;
  owner: string;
  calendar: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  allDay: boolean;
  location?: string;
  attendees: string[];
  reminder?: number;
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createCalendarSchema,
  createEventSchema,
  eventRangeQuerySchema,
  updateCalendarSchema,
  updateEventSchema,
  type CreateCalendar,
  type CreateEvent,
  type EventRangeQuery,
  type UpdateCalendar,
  type UpdateEvent,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { CalendarService } from './calendar.service';

@ApiTags('Calendar')
@ApiCookieAuth()
@Controller()
export class CalendarController {
  constructor(private readonly calendar: CalendarService) {}

  // ── Calendars ──────────────────────────────────────────────────────────

  @Get('calendars')
  @ApiOperation({ summary: 'List my calendars (creates defaults on first use)' })
  listCalendars(@CurrentUser('id') userId: string) {
    return this.calendar.listCalendars(userId);
  }

  @Post('calendars')
  @ApiOperation({ summary: 'Create a calendar' })
  createCalendar(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createCalendarSchema)) dto: CreateCalendar,
  ) {
    return this.calendar.createCalendar(userId, dto);
  }

  @Patch('calendars/:id')
  @ApiOperation({ summary: 'Update a calendar' })
  updateCalendar(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateCalendarSchema)) dto: UpdateCalendar,
  ) {
    return this.calendar.updateCalendar(userId, id, dto);
  }

  @Delete('calendars/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a calendar and its events' })
  async removeCalendar(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.calendar.removeCalendar(userId, id);
  }

  // ── Events ─────────────────────────────────────────────────────────────

  @Get('events')
  @ApiOperation({ summary: 'List events in a date range' })
  listEvents(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(eventRangeQuerySchema)) query: EventRangeQuery,
  ) {
    return this.calendar.listEvents(userId, query);
  }

  @Get('events/:id')
  @ApiOperation({ summary: 'Get an event by id' })
  findEvent(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.calendar.findEvent(userId, id);
  }

  @Post('events')
  @ApiOperation({ summary: 'Create an event' })
  createEvent(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createEventSchema)) dto: CreateEvent,
  ) {
    return this.calendar.createEvent(userId, dto);
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update an event' })
  updateEvent(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateEventSchema)) dto: UpdateEvent,
  ) {
    return this.calendar.updateEvent(userId, id, dto);
  }

  @Delete('events/:id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an event' })
  async removeEvent(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.calendar.removeEvent(userId, id);
  }
}

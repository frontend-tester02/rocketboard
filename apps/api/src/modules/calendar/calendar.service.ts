import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  CreateCalendar,
  CreateEvent,
  EventRangeQuery,
  UpdateCalendar,
  UpdateEvent,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Calendar } from './schemas/calendar.schema';
import { Event } from './schemas/event.schema';

const DEFAULT_CALENDARS = [
  { name: 'My Calendar', color: '#3E4DF5' },
  { name: 'Work', color: '#F7A35C' },
  { name: 'Personal', color: '#22C55E' },
];

@Injectable()
export class CalendarService {
  constructor(
    @InjectModel(Calendar.name) private readonly calendarModel: Model<Calendar>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
  ) {}

  // ── Calendars ──────────────────────────────────────────────────────────

  async listCalendars(userId: string) {
    const owner = new Types.ObjectId(userId);
    let calendars = await this.calendarModel
      .find({ $or: [{ owner }, { members: owner }] })
      .sort({ createdAt: 1 })
      .exec();

    // Bootstrap a few default calendars on first visit.
    if (calendars.length === 0) {
      calendars = await this.calendarModel.insertMany(
        DEFAULT_CALENDARS.map((c) => ({ ...c, owner, isVisible: true })),
      );
    }
    return calendars;
  }

  createCalendar(userId: string, data: CreateCalendar) {
    return this.calendarModel.create({
      ...data,
      owner: new Types.ObjectId(userId),
    });
  }

  async updateCalendar(userId: string, id: string, data: UpdateCalendar) {
    await this.ensureCalendarOwner(userId, id);
    const calendar = await this.calendarModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    if (!calendar) throw new NotFoundException('Calendar not found');
    return calendar;
  }

  async removeCalendar(userId: string, id: string): Promise<void> {
    await this.ensureCalendarOwner(userId, id);
    await this.eventModel.deleteMany({ calendar: new Types.ObjectId(id) }).exec();
    await this.calendarModel.deleteOne({ _id: id }).exec();
  }

  private async ensureCalendarOwner(userId: string, id: string): Promise<void> {
    const calendar = await this.calendarModel.findById(id).select('owner').exec();
    if (!calendar) throw new NotFoundException('Calendar not found');
    if (String(calendar.owner) !== userId) {
      throw new ForbiddenException('Not your calendar');
    }
  }

  // ── Events ─────────────────────────────────────────────────────────────

  listEvents(userId: string, query: EventRangeQuery) {
    const owner = new Types.ObjectId(userId);
    const filter: FilterQuery<Event> = {
      owner,
      // Overlap with the requested [from, to] range.
      start: { $lte: query.to },
      end: { $gte: query.from },
    };
    if (query.calendarIds) {
      const ids = query.calendarIds
        .split(',')
        .map((s) => s.trim())
        .filter((s) => Types.ObjectId.isValid(s))
        .map((s) => new Types.ObjectId(s));
      filter.calendar = { $in: ids };
    }
    return this.eventModel.find(filter).sort({ start: 1 }).exec();
  }

  async findEvent(userId: string, id: string) {
    const event = await this.eventModel.findById(id).exec();
    if (!event) throw new NotFoundException('Event not found');
    if (String(event.owner) !== userId) throw new ForbiddenException('Not your event');
    return event;
  }

  createEvent(userId: string, data: CreateEvent) {
    return this.eventModel.create({
      ...data,
      owner: new Types.ObjectId(userId),
      calendar: new Types.ObjectId(data.calendar),
    });
  }

  async updateEvent(userId: string, id: string, data: UpdateEvent) {
    await this.findEvent(userId, id);
    const patch: Record<string, unknown> = { ...data };
    if (data.calendar) patch.calendar = new Types.ObjectId(data.calendar);
    const event = await this.eventModel
      .findByIdAndUpdate(id, patch, { new: true })
      .exec();
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async removeEvent(userId: string, id: string): Promise<void> {
    await this.findEvent(userId, id);
    await this.eventModel.deleteOne({ _id: id }).exec();
  }
}

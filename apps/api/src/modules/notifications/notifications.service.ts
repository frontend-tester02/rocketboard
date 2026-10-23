import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  NotificationDto,
  NotificationFeed,
  NotificationListQuery,
  NotificationType,
  NotifyEventPayload,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Notification, type NotificationDocument } from './schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private readonly model: Model<Notification>,
  ) {}

  async create(payload: NotifyEventPayload): Promise<NotificationDto> {
    const doc = await this.model.create({
      user: new Types.ObjectId(payload.user),
      type: payload.type,
      title: payload.title,
      body: payload.body,
      link: payload.link,
      payload: payload.payload,
    });
    return this.toDto(doc);
  }

  async list(userId: string, query: NotificationListQuery): Promise<NotificationFeed> {
    const user = new Types.ObjectId(userId);
    const filter: FilterQuery<Notification> = { user };
    if (query.unread) filter.isRead = false;
    const [docs, unread] = await Promise.all([
      this.model.find(filter).sort({ createdAt: -1 }).limit(query.limit).exec(),
      this.model.countDocuments({ user, isRead: false }).exec(),
    ]);
    return { data: docs.map((d) => this.toDto(d)), unread };
  }

  async unreadCount(userId: string): Promise<{ unread: number }> {
    const unread = await this.model
      .countDocuments({ user: new Types.ObjectId(userId), isRead: false })
      .exec();
    return { unread };
  }

  async markRead(userId: string, id: string): Promise<void> {
    const res = await this.model
      .updateOne({ _id: id, user: new Types.ObjectId(userId) }, { $set: { isRead: true } })
      .exec();
    if (res.matchedCount === 0) throw new NotFoundException('Notification not found');
  }

  async markAllRead(userId: string): Promise<void> {
    await this.model
      .updateMany({ user: new Types.ObjectId(userId), isRead: false }, { $set: { isRead: true } })
      .exec();
  }

  private toDto(doc: NotificationDocument & { createdAt?: Date }): NotificationDto {
    return {
      id: String(doc._id),
      type: doc.type as NotificationType,
      title: doc.title,
      body: doc.body,
      link: doc.link,
      isRead: doc.isRead,
      createdAt: doc.createdAt?.toISOString(),
    };
  }
}

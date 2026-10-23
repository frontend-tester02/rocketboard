import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type {
  ActivityActor,
  ActivityDto,
  ActivityEntityType,
  ActivityEventPayload,
  ActivityFeed,
  ActivityListQuery,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Activity, type ActivityDocument } from './schemas/activity.schema';

interface PopulatedActor {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar?: string;
}

@Injectable()
export class ActivitiesService {
  constructor(@InjectModel(Activity.name) private readonly model: Model<Activity>) {}

  async log(payload: ActivityEventPayload): Promise<void> {
    await this.model.create({
      actor:
        payload.actor && Types.ObjectId.isValid(payload.actor)
          ? new Types.ObjectId(payload.actor)
          : undefined,
      action: payload.action,
      entityType: payload.entityType,
      entityId: payload.entityId,
      meta: payload.meta,
    });
  }

  async list(query: ActivityListQuery): Promise<ActivityFeed> {
    const filter: FilterQuery<Activity> = {};
    if (query.entityType) filter.entityType = query.entityType;
    if (query.cursor && Types.ObjectId.isValid(query.cursor)) {
      filter._id = { $lt: new Types.ObjectId(query.cursor) };
    }

    const docs = await this.model
      .find(filter)
      .sort({ _id: -1 })
      .limit(query.limit + 1)
      .populate('actor', 'firstName lastName avatar')
      .exec();

    const hasMore = docs.length > query.limit;
    const page = hasMore ? docs.slice(0, query.limit) : docs;
    return {
      data: page.map((d) => this.toDto(d)),
      nextCursor: hasMore ? String(page[page.length - 1]!._id) : null,
    };
  }

  private toDto(doc: ActivityDocument & { createdAt?: Date }): ActivityDto {
    const raw = doc.actor as unknown;
    let actor: ActivityActor | null = null;
    if (raw && typeof raw === 'object' && 'firstName' in (raw as PopulatedActor)) {
      const a = raw as PopulatedActor;
      actor = { id: String(a._id), firstName: a.firstName, lastName: a.lastName, avatar: a.avatar };
    }
    return {
      id: String(doc._id),
      actor,
      action: doc.action,
      entityType: doc.entityType as ActivityEntityType,
      entityId: doc.entityId,
      meta: doc.meta,
      createdAt: doc.createdAt?.toISOString(),
    };
  }
}

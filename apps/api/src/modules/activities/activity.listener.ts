import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { ACTIVITY_EVENT, type ActivityEventPayload } from '@rocket/shared';
import { ActivitiesService } from './activities.service';

/** Persists activity events emitted by domain services. */
@Injectable()
export class ActivityListener {
  constructor(private readonly activities: ActivitiesService) {}

  @OnEvent(ACTIVITY_EVENT, { async: true })
  async handle(payload: ActivityEventPayload): Promise<void> {
    await this.activities.log(payload).catch(() => undefined);
  }
}

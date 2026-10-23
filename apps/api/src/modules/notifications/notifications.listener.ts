import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NOTIFY_EVENT, type NotifyEventPayload } from '@rocket/shared';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

/** Persists a notification and pushes it to the recipient over the socket. */
@Injectable()
export class NotificationsListener {
  constructor(
    private readonly notifications: NotificationsService,
    private readonly gateway: NotificationsGateway,
  ) {}

  @OnEvent(NOTIFY_EVENT, { async: true })
  async handle(payload: NotifyEventPayload): Promise<void> {
    try {
      const dto = await this.notifications.create(payload);
      this.gateway.pushToUser(payload.user, dto);
    } catch {
      /* swallow — a failed notification should never break the originating action */
    }
  }
}

import { Controller, Get, HttpCode, Param, Patch, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { notificationListQuerySchema, type NotificationListQuery } from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@ApiCookieAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'List notifications (+ unread count)' })
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(notificationListQuerySchema)) query: NotificationListQuery,
  ) {
    return this.notifications.list(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread notification count' })
  unreadCount(@CurrentUser('id') userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Patch('read-all')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark all notifications read' })
  async markAllRead(@CurrentUser('id') userId: string): Promise<void> {
    await this.notifications.markAllRead(userId);
  }

  @Patch(':id/read')
  @HttpCode(204)
  @ApiOperation({ summary: 'Mark a notification read' })
  async markRead(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.notifications.markRead(userId, id);
  }
}

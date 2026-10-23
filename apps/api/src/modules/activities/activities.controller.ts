import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { activityListQuerySchema, type ActivityListQuery } from '@rocket/shared';
import { ZodValidationPipe } from '../../common';
import { ActivitiesService } from './activities.service';

@ApiTags('Activities')
@ApiCookieAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activities: ActivitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Activity feed (cursor paginated)' })
  list(@Query(new ZodValidationPipe(activityListQuerySchema)) query: ActivityListQuery) {
    return this.activities.list(query);
  }
}

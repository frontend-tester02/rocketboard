import { Controller, Get, Query } from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { dashboardRangeQuerySchema, type DashboardRangeQuery } from '@rocket/shared';
import { ZodValidationPipe } from '../../common';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@ApiCookieAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  @ApiOperation({ summary: 'Income / sales / new clients with period deltas' })
  overview(@Query(new ZodValidationPipe(dashboardRangeQuerySchema)) query: DashboardRangeQuery) {
    return this.dashboard.overview(query);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Daily income vs expense' })
  statistics(@Query(new ZodValidationPipe(dashboardRangeQuerySchema)) query: DashboardRangeQuery) {
    return this.dashboard.statistics(query);
  }

  @Get('sales')
  @ApiOperation({ summary: 'Daily sales (total + count)' })
  sales(@Query(new ZodValidationPipe(dashboardRangeQuerySchema)) query: DashboardRangeQuery) {
    return this.dashboard.sales(query);
  }

  @Get('tasks-summary')
  @ApiOperation({ summary: 'Task counts by priority' })
  tasksSummary() {
    return this.dashboard.tasksSummary();
  }

  @Get('projects-summary')
  @ApiOperation({ summary: 'Project counts by status' })
  projectsSummary() {
    return this.dashboard.projectsSummary();
  }
}

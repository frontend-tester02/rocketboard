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
  createProjectSchema,
  projectListQuerySchema,
  updateProjectSchema,
  type CreateProject,
  type ProjectListQuery,
  type UpdateProject,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { ProjectsService } from './projects.service';

@ApiTags('Projects')
@ApiCookieAuth()
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projects: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects (filter by status / member / date)' })
  list(
    @CurrentUser('id') userId: string,
    @Query(new ZodValidationPipe(projectListQuerySchema)) query: ProjectListQuery,
  ) {
    return this.projects.list(userId, query);
  }

  @Get('counts')
  @ApiOperation({ summary: 'Project counts per status' })
  counts(@CurrentUser('id') userId: string) {
    return this.projects.counts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project' })
  getOne(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.projects.getById(userId, id);
  }

  @Get(':id/tasks')
  @ApiOperation({ summary: 'Project tasks (for the Gantt view)' })
  tasks(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.projects.getTasks(userId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a project (auto-creates a board)' })
  create(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createProjectSchema)) dto: CreateProject,
  ) {
    return this.projects.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a project' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) dto: UpdateProject,
  ) {
    return this.projects.update(userId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete a project (and its board)' })
  async remove(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.projects.remove(userId, id);
  }
}

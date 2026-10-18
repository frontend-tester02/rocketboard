import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  createBoardSchema,
  createColumnSchema,
  createTaskCommentSchema,
  createTaskLabelSchema,
  createTaskSchema,
  moveTaskSchema,
  updateBoardSchema,
  updateColumnSchema,
  updateTaskLabelSchema,
  updateTaskSchema,
  type CreateBoard,
  type CreateColumn,
  type CreateTask,
  type CreateTaskComment,
  type CreateTaskLabel,
  type MoveTask,
  type UpdateBoard,
  type UpdateColumn,
  type UpdateTask,
  type UpdateTaskLabel,
} from '@rocket/shared';
import { CurrentUser, ParseObjectIdPipe, ZodValidationPipe } from '../../common';
import { TasksService } from './tasks.service';

@ApiTags('Tasks')
@ApiCookieAuth()
@Controller()
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  // ── Boards ───────────────────────────────────────────────────────────────
  @Get('boards')
  listBoards(@CurrentUser('id') userId: string) {
    return this.tasks.listBoards(userId);
  }

  @Post('boards')
  createBoard(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createBoardSchema)) dto: CreateBoard,
  ) {
    return this.tasks.createBoard(userId, dto);
  }

  @Get('boards/:id')
  @ApiOperation({ summary: 'Board with its columns + tasks' })
  getBoard(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.tasks.getBoard(userId, id);
  }

  @Patch('boards/:id')
  updateBoard(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateBoardSchema)) dto: UpdateBoard,
  ) {
    return this.tasks.updateBoard(userId, id, dto);
  }

  @Delete('boards/:id')
  @HttpCode(204)
  async removeBoard(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.tasks.removeBoard(userId, id);
  }

  // ── Columns ──────────────────────────────────────────────────────────────
  @Post('boards/:id/columns')
  addColumn(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(createColumnSchema)) dto: CreateColumn,
  ) {
    return this.tasks.addColumn(userId, id, dto);
  }

  @Patch('boards/:id/columns/:columnId')
  updateColumn(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('columnId') columnId: string,
    @Body(new ZodValidationPipe(updateColumnSchema)) dto: UpdateColumn,
  ) {
    return this.tasks.updateColumn(userId, id, columnId, dto);
  }

  @Delete('boards/:id/columns/:columnId')
  removeColumn(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Param('columnId') columnId: string,
  ) {
    return this.tasks.removeColumn(userId, id, columnId);
  }

  // ── Tasks ────────────────────────────────────────────────────────────────
  @Post('tasks')
  createTask(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createTaskSchema)) dto: CreateTask,
  ) {
    return this.tasks.createTask(userId, dto);
  }

  @Get('tasks/:id')
  getTask(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.tasks.getTask(userId, id);
  }

  @Patch('tasks/:id/move')
  moveTask(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(moveTaskSchema)) dto: MoveTask,
  ) {
    return this.tasks.moveTask(userId, id, dto);
  }

  @Patch('tasks/:id')
  updateTask(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskSchema)) dto: UpdateTask,
  ) {
    return this.tasks.updateTask(userId, id, dto);
  }

  @Delete('tasks/:id')
  @HttpCode(204)
  async removeTask(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.tasks.removeTask(userId, id);
  }

  // ── Comments ─────────────────────────────────────────────────────────────
  @Get('tasks/:id/comments')
  listComments(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ) {
    return this.tasks.listComments(userId, id);
  }

  @Post('tasks/:id/comments')
  addComment(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(createTaskCommentSchema)) dto: CreateTaskComment,
  ) {
    return this.tasks.addComment(userId, id, dto.text);
  }

  // ── Labels ───────────────────────────────────────────────────────────────
  @Get('task-labels')
  listLabels(@CurrentUser('id') userId: string) {
    return this.tasks.listLabels(userId);
  }

  @Post('task-labels')
  createLabel(
    @CurrentUser('id') userId: string,
    @Body(new ZodValidationPipe(createTaskLabelSchema)) dto: CreateTaskLabel,
  ) {
    return this.tasks.createLabel(userId, dto);
  }

  @Patch('task-labels/:id')
  updateLabel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
    @Body(new ZodValidationPipe(updateTaskLabelSchema)) dto: UpdateTaskLabel,
  ) {
    return this.tasks.updateLabel(userId, id, dto);
  }

  @Delete('task-labels/:id')
  @HttpCode(204)
  async removeLabel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseObjectIdPipe) id: string,
  ): Promise<void> {
    await this.tasks.removeLabel(userId, id);
  }
}

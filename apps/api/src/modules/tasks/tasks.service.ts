import { randomUUID } from 'node:crypto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
  ACTIVITY_EVENT,
  ActivityEntityType,
  NOTIFY_EVENT,
  NotificationType,
  TaskPriority,
  type BoardColumn,
  type CreateBoard,
  type CreateColumn,
  type CreateTask,
  type CreateTaskLabel,
  type MoveTask,
  type UpdateBoard,
  type UpdateColumn,
  type UpdateTask,
} from '@rocket/shared';
import { Model, Types } from 'mongoose';
import { Board } from './schemas/board.schema';
import { Task } from './schemas/task.schema';
import { TaskComment } from './schemas/task-comment.schema';
import { TaskLabel } from './schemas/task-label.schema';

function defaultColumns(): BoardColumn[] {
  return [
    { id: randomUUID(), title: 'To Do', order: 0, color: '#F59E0B' },
    { id: randomUUID(), title: 'In Progress', order: 1, color: '#06B6D4' },
    { id: randomUUID(), title: 'Done', order: 2, color: '#22C55E' },
  ];
}

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(TaskComment.name)
    private readonly commentModel: Model<TaskComment>,
    @InjectModel(TaskLabel.name) private readonly labelModel: Model<TaskLabel>,
    private readonly events: EventEmitter2,
  ) {}

  // ── Boards ───────────────────────────────────────────────────────────────
  async listBoards(userId: string) {
    const owner = new Types.ObjectId(userId);
    let boards = await this.boardModel
      .find({ $or: [{ owner }, { members: owner }] })
      .sort({ createdAt: 1 })
      .exec();
    if (boards.length === 0) {
      boards = [await this.bootstrap(userId)];
    }
    return boards;
  }

  async getBoard(userId: string, id: string) {
    const board = await this.ensureBoard(userId, id);
    const tasks = await this.taskModel
      .find({ board: board._id })
      .sort({ order: 1 })
      .exec();
    const obj = board.toJSON() as Record<string, unknown>;
    obj.tasks = tasks.map((t) => t.toJSON());
    return obj;
  }

  createBoard(userId: string, dto: CreateBoard) {
    return this.boardModel.create({
      owner: new Types.ObjectId(userId),
      name: dto.name,
      project: dto.project ? new Types.ObjectId(dto.project) : undefined,
      members: dto.members?.map((m) => new Types.ObjectId(m)) ?? [],
      columns: defaultColumns(),
    });
  }

  async updateBoard(userId: string, id: string, dto: UpdateBoard) {
    await this.ensureBoard(userId, id);
    return this.boardModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async removeBoard(userId: string, id: string): Promise<void> {
    await this.ensureBoard(userId, id);
    await this.taskModel.deleteMany({ board: new Types.ObjectId(id) }).exec();
    await this.boardModel.deleteOne({ _id: id }).exec();
  }

  // ── Columns ──────────────────────────────────────────────────────────────
  async addColumn(userId: string, boardId: string, dto: CreateColumn) {
    const board = await this.ensureBoard(userId, boardId);
    const order = board.columns.length;
    board.columns.push({ id: randomUUID(), title: dto.title, order, color: dto.color });
    await board.save();
    return board;
  }

  async updateColumn(
    userId: string,
    boardId: string,
    columnId: string,
    dto: UpdateColumn,
  ) {
    const board = await this.ensureBoard(userId, boardId);
    const col = board.columns.find((c) => c.id === columnId);
    if (!col) throw new NotFoundException('Column not found');
    if (dto.title !== undefined) col.title = dto.title;
    if (dto.color !== undefined) col.color = dto.color;
    if (dto.order !== undefined) col.order = dto.order;
    await board.save();
    return board;
  }

  async removeColumn(userId: string, boardId: string, columnId: string) {
    const board = await this.ensureBoard(userId, boardId);
    board.columns = board.columns.filter((c) => c.id !== columnId);
    await board.save();
    await this.taskModel
      .deleteMany({ board: board._id, columnId })
      .exec();
    return board;
  }

  // ── Tasks ────────────────────────────────────────────────────────────────
  async createTask(userId: string, dto: CreateTask) {
    await this.ensureBoard(userId, dto.board);
    const last = await this.taskModel
      .findOne({ board: new Types.ObjectId(dto.board), columnId: dto.columnId })
      .sort({ order: -1 })
      .select('order')
      .exec();
    const order = (last?.order ?? 0) + 1024;
    const task = await this.taskModel.create({
      ...dto,
      board: new Types.ObjectId(dto.board),
      assignees: dto.assignees?.map((a) => new Types.ObjectId(a)) ?? [],
      order,
    });

    this.events.emit(ACTIVITY_EVENT, {
      actor: userId,
      action: 'created',
      entityType: ActivityEntityType.Task,
      entityId: String(task._id),
      meta: { title: task.title },
    });

    // Notify assignees (other than the creator).
    for (const assignee of task.assignees) {
      if (String(assignee) === userId) continue;
      this.events.emit(NOTIFY_EVENT, {
        user: String(assignee),
        type: NotificationType.TaskAssigned,
        title: 'New task assigned',
        body: task.title,
        link: `/tasks/board`,
        payload: { taskId: String(task._id) },
      });
    }

    return task;
  }

  async getTask(userId: string, id: string) {
    const task = await this.taskModel.findById(id).exec();
    if (!task) throw new NotFoundException('Task not found');
    await this.ensureBoard(userId, String(task.board));
    return task;
  }

  async updateTask(userId: string, id: string, dto: UpdateTask) {
    const task = await this.getTask(userId, id);
    const patch: Record<string, unknown> = { ...dto };
    if (dto.assignees)
      patch.assignees = dto.assignees.map((a) => new Types.ObjectId(a));
    return this.taskModel.findByIdAndUpdate(task.id, patch, { new: true }).exec();
  }

  async moveTask(userId: string, id: string, dto: MoveTask) {
    const task = await this.getTask(userId, id);
    task.columnId = dto.columnId;
    task.order = dto.order;
    await task.save();
    return task;
  }

  async removeTask(userId: string, id: string): Promise<void> {
    const task = await this.getTask(userId, id);
    await this.commentModel.deleteMany({ task: task._id }).exec();
    await this.taskModel.deleteOne({ _id: id }).exec();
  }

  // ── Comments ─────────────────────────────────────────────────────────────
  async listComments(userId: string, taskId: string) {
    await this.getTask(userId, taskId);
    return this.commentModel
      .find({ task: new Types.ObjectId(taskId) })
      .populate('author', 'firstName lastName avatar')
      .sort({ createdAt: 1 })
      .exec();
  }

  async addComment(userId: string, taskId: string, text: string) {
    await this.getTask(userId, taskId);
    const comment = await this.commentModel.create({
      task: new Types.ObjectId(taskId),
      author: new Types.ObjectId(userId),
      text,
    });
    return comment.populate('author', 'firstName lastName avatar');
  }

  // ── Labels ───────────────────────────────────────────────────────────────
  listLabels(userId: string) {
    return this.labelModel
      .find({ owner: new Types.ObjectId(userId) })
      .sort({ name: 1 })
      .exec();
  }

  createLabel(userId: string, dto: CreateTaskLabel) {
    return this.labelModel.create({ ...dto, owner: new Types.ObjectId(userId) });
  }

  async updateLabel(userId: string, id: string, dto: Partial<CreateTaskLabel>) {
    const label = await this.labelModel.findById(id).select('owner').exec();
    if (!label || String(label.owner) !== userId)
      throw new NotFoundException('Label not found');
    return this.labelModel.findByIdAndUpdate(id, dto, { new: true }).exec();
  }

  async removeLabel(userId: string, id: string): Promise<void> {
    const label = await this.labelModel.findById(id).select('owner name').exec();
    if (!label || String(label.owner) !== userId)
      throw new NotFoundException('Label not found');
    await this.taskModel
      .updateMany({ labels: label.name }, { $pull: { labels: label.name } })
      .exec();
    await this.labelModel.deleteOne({ _id: id }).exec();
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  private async ensureBoard(userId: string, boardId: string) {
    const board = await this.boardModel.findById(boardId).exec();
    if (!board) throw new NotFoundException('Board not found');
    const ok =
      String(board.owner) === userId ||
      board.members.some((m) => String(m) === userId);
    if (!ok) throw new ForbiddenException('Not your board');
    return board;
  }

  private async bootstrap(userId: string) {
    const columns = defaultColumns();
    const board = await this.boardModel.create({
      owner: new Types.ObjectId(userId),
      name: 'My Board',
      members: [],
      columns,
    });
    const [todo, doing, done] = columns;
    await this.taskModel.insertMany([
      {
        board: board._id,
        columnId: todo!.id,
        order: 1024,
        title: 'Design the landing page',
        priority: TaskPriority.High,
        labels: ['Design'],
        checklist: [],
        attachments: [],
      },
      {
        board: board._id,
        columnId: todo!.id,
        order: 2048,
        title: 'Write API documentation',
        priority: TaskPriority.Medium,
        checklist: [],
        attachments: [],
      },
      {
        board: board._id,
        columnId: doing!.id,
        order: 1024,
        title: 'Build the dashboard widgets',
        priority: TaskPriority.Urgent,
        labels: ['Dev'],
        checklist: [],
        attachments: [],
      },
      {
        board: board._id,
        columnId: done!.id,
        order: 1024,
        title: 'Set up the project repo',
        priority: TaskPriority.Low,
        checklist: [],
        attachments: [],
      },
    ] as never);
    return board;
  }
}

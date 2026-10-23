import { randomUUID } from 'node:crypto';
import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import {
  ACTIVITY_EVENT,
  ActivityEntityType,
  ProjectStatus,
  type CreateProject,
  type ProjectCounts,
  type ProjectListQuery,
  type UpdateProject,
} from '@rocket/shared';
import { FilterQuery, Model, Types } from 'mongoose';
import { Board } from '../tasks/schemas/board.schema';
import { Task } from '../tasks/schemas/task.schema';
import { Project } from './schemas/project.schema';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
    @InjectModel(Board.name) private readonly boardModel: Model<Board>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    private readonly events: EventEmitter2,
  ) {}

  async list(userId: string, query: ProjectListQuery) {
    const owner = new Types.ObjectId(userId);
    const filter: FilterQuery<Project> = {
      $or: [{ owner }, { members: owner }],
    };
    if (query.status) filter.status = query.status;
    if (query.member && Types.ObjectId.isValid(query.member)) {
      filter.members = new Types.ObjectId(query.member);
    }
    if (query.search) {
      const rx = new RegExp(query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.name = rx;
    }
    if (query.dateFrom || query.dateTo) {
      filter.startDate = {};
      if (query.dateFrom) filter.startDate.$gte = query.dateFrom;
      if (query.dateTo) filter.startDate.$lte = query.dateTo;
    }
    const projects = await this.projectModel.find(filter).sort({ createdAt: -1 }).exec();
    return Promise.all(projects.map((p) => this.withProgress(p)));
  }

  async counts(userId: string): Promise<ProjectCounts> {
    const owner = new Types.ObjectId(userId);
    const base = { $or: [{ owner }, { members: owner }] };
    const [all, ongoing, hold, done] = await Promise.all([
      this.projectModel.countDocuments(base).exec(),
      this.projectModel.countDocuments({ ...base, status: ProjectStatus.Ongoing }).exec(),
      this.projectModel.countDocuments({ ...base, status: ProjectStatus.Hold }).exec(),
      this.projectModel.countDocuments({ ...base, status: ProjectStatus.Done }).exec(),
    ]);
    return { all, ongoing, hold, done };
  }

  async getById(userId: string, id: string) {
    const project = await this.ensureProject(userId, id);
    return this.withProgress(project);
  }

  async create(userId: string, dto: CreateProject) {
    const project = await this.projectModel.create({
      owner: new Types.ObjectId(userId),
      name: dto.name,
      description: dto.description,
      client: dto.client,
      coverColor: dto.coverColor,
      icon: dto.icon,
      members: dto.members?.map((m) => new Types.ObjectId(m)) ?? [],
      status: dto.status,
      startDate: dto.startDate,
      endDate: dto.endDate,
      budget: dto.budget,
      tags: dto.tags ?? [],
    });

    // Auto-create a board for the project.
    await this.boardModel.create({
      owner: new Types.ObjectId(userId),
      name: dto.name,
      project: project._id,
      members: project.members,
      columns: [
        { id: randomUUID(), title: 'To Do', order: 0, color: '#F59E0B' },
        { id: randomUUID(), title: 'In Progress', order: 1, color: '#06B6D4' },
        { id: randomUUID(), title: 'Done', order: 2, color: '#22C55E' },
      ],
    });

    this.events.emit(ACTIVITY_EVENT, {
      actor: userId,
      action: 'created',
      entityType: ActivityEntityType.Project,
      entityId: String(project._id),
      meta: { name: project.name },
    });

    return this.withProgress(project);
  }

  async update(userId: string, id: string, dto: UpdateProject) {
    await this.ensureProject(userId, id);
    const patch: Record<string, unknown> = { ...dto };
    if (dto.members) patch.members = dto.members.map((m) => new Types.ObjectId(m));
    const project = await this.projectModel.findByIdAndUpdate(id, patch, { new: true }).exec();
    if (!project) throw new NotFoundException('Project not found');
    return this.withProgress(project);
  }

  async remove(userId: string, id: string): Promise<void> {
    const project = await this.ensureProject(userId, id);
    const board = await this.boardModel.findOne({ project: new Types.ObjectId(id) }).exec();
    if (board) {
      await this.taskModel.deleteMany({ board: board._id }).exec();
      await this.boardModel.deleteOne({ _id: board._id }).exec();
    }
    await this.projectModel.deleteOne({ _id: id }).exec();

    this.events.emit(ACTIVITY_EVENT, {
      actor: userId,
      action: 'deleted',
      entityType: ActivityEntityType.Project,
      entityId: id,
      meta: { name: project.name },
    });
  }

  /** Tasks of the project's board, with start/end for the Gantt view. */
  async getTasks(userId: string, id: string) {
    await this.ensureProject(userId, id);
    const board = await this.boardModel.findOne({ project: new Types.ObjectId(id) }).exec();
    if (!board) return [];
    return this.taskModel.find({ board: board._id }).sort({ order: 1 }).exec();
  }

  private async ensureProject(userId: string, id: string) {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Project not found');
    const ok =
      String(project.owner) === userId ||
      project.members.some((m) => String(m) === userId);
    if (!ok) throw new ForbiddenException('Not your project');
    return project;
  }

  /** Attach computed progress + taskCount + board id to a project document. */
  private async withProgress(project: Project & { _id: Types.ObjectId }) {
    const board = await this.boardModel
      .findOne({ project: project._id })
      .select('_id columns')
      .exec();
    let progress = 0;
    let taskCount = 0;
    let boardId: string | undefined;
    if (board) {
      boardId = String(board._id);
      const doneCol = [...board.columns].sort((a, b) => a.order - b.order).at(-1);
      const [total, done] = await Promise.all([
        this.taskModel.countDocuments({ board: board._id }).exec(),
        doneCol
          ? this.taskModel.countDocuments({ board: board._id, columnId: doneCol.id }).exec()
          : Promise.resolve(0),
      ]);
      taskCount = total;
      progress = total ? Math.round((done / total) * 100) : 0;
    }
    const obj = (project as unknown as { toJSON: () => Record<string, unknown> }).toJSON();
    obj.progress = progress;
    obj.taskCount = taskCount;
    obj.board = boardId;
    return obj;
  }
}

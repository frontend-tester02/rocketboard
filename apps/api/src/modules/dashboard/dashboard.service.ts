import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  ProjectStatus,
  TaskPriority,
  TransactionType,
  type DashboardOverview,
  type DashboardRangeQuery,
  type DailyIncomeExpense,
  type MetricDelta,
  type ProjectsSummary,
  type SalesPoint,
  type TasksSummary,
} from '@rocket/shared';
import { Model } from 'mongoose';
import { Customer } from '../customers/schemas/customer.schema';
import { Order } from '../orders/schemas/order.schema';
import { Project } from '../projects/schemas/project.schema';
import { Task } from '../tasks/schemas/task.schema';
import { Transaction } from '../wallet/schemas/transaction.schema';

const CACHE_TTL = 5 * 60 * 1000;

function delta(value: number, prev: number): MetricDelta {
  const change = prev === 0 ? (value > 0 ? 100 : 0) : ((value - prev) / prev) * 100;
  return { value, change: Math.round(change * 10) / 10 };
}

/**
 * Dashboard aggregations with a small in-memory TTL cache (5 min).
 * Swap `cached()` for a Redis-backed store to scale across instances.
 */
@Injectable()
export class DashboardService {
  private readonly cache = new Map<string, { at: number; value: unknown }>();

  constructor(
    @InjectModel(Order.name) private readonly orderModel: Model<Order>,
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
    @InjectModel(Transaction.name) private readonly txModel: Model<Transaction>,
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(Project.name) private readonly projectModel: Model<Project>,
  ) {}

  private async cached<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const hit = this.cache.get(key);
    if (hit && Date.now() - hit.at < CACHE_TTL) return hit.value as T;
    const value = await fn();
    this.cache.set(key, { at: Date.now(), value });
    return value;
  }

  private range(q: DashboardRangeQuery): { from: Date; to: Date } {
    const to = q.to ?? new Date();
    const from = q.from ?? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000);
    return { from, to };
  }

  async overview(q: DashboardRangeQuery): Promise<DashboardOverview> {
    const { from, to } = this.range(q);
    const span = to.getTime() - from.getTime();
    const prevFrom = new Date(from.getTime() - span);
    const key = `overview:${from.toISOString()}:${to.toISOString()}`;

    return this.cached(key, async () => {
      const [income, prevIncome, sales, prevSales, clients, prevClients] = await Promise.all([
        this.ordersTotal(from, to),
        this.ordersTotal(prevFrom, from),
        this.ordersCount(from, to),
        this.ordersCount(prevFrom, from),
        this.customerModel.countDocuments({ createdAt: { $gte: from, $lte: to } }).exec(),
        this.customerModel.countDocuments({ createdAt: { $gte: prevFrom, $lt: from } }).exec(),
      ]);
      return {
        income: delta(income, prevIncome),
        sales: delta(sales, prevSales),
        newClients: delta(clients, prevClients),
      };
    });
  }

  async statistics(q: DashboardRangeQuery): Promise<DailyIncomeExpense[]> {
    const { from, to } = this.range(q);
    const key = `stats:${from.toISOString()}:${to.toISOString()}`;
    return this.cached(key, async () => {
      const rows = await this.txModel.aggregate<{ _id: string; income: number; expense: number }>([
        { $match: { date: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            income: {
              $sum: { $cond: [{ $eq: ['$type', TransactionType.Income] }, '$amount', 0] },
            },
            expense: {
              $sum: { $cond: [{ $eq: ['$type', TransactionType.Expense] }, '$amount', 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      return rows.map((r) => ({ date: r._id, income: r.income, expense: r.expense }));
    });
  }

  async sales(q: DashboardRangeQuery): Promise<SalesPoint[]> {
    const { from, to } = this.range(q);
    const key = `sales:${from.toISOString()}:${to.toISOString()}`;
    return this.cached(key, async () => {
      const rows = await this.orderModel.aggregate<{ _id: string; total: number; count: number }>([
        { $match: { createdAt: { $gte: from, $lte: to } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            total: { $sum: '$total' },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]);
      return rows.map((r) => ({ date: r._id, total: r.total, count: r.count }));
    });
  }

  async tasksSummary(): Promise<TasksSummary> {
    return this.cached('tasks-summary', async () => {
      const rows = await this.taskModel.aggregate<{ _id: string; n: number }>([
        { $group: { _id: '$priority', n: { $sum: 1 } } },
      ]);
      const by = (p: TaskPriority) => rows.find((r) => r._id === p)?.n ?? 0;
      return {
        total: rows.reduce((s, r) => s + r.n, 0),
        high: by(TaskPriority.High) + by(TaskPriority.Urgent),
        medium: by(TaskPriority.Medium),
        low: by(TaskPriority.Low),
      };
    });
  }

  async projectsSummary(): Promise<ProjectsSummary> {
    return this.cached('projects-summary', async () => {
      const rows = await this.projectModel.aggregate<{ _id: string; n: number }>([
        { $group: { _id: '$status', n: { $sum: 1 } } },
      ]);
      const by = (s: ProjectStatus) => rows.find((r) => r._id === s)?.n ?? 0;
      return {
        total: rows.reduce((s, r) => s + r.n, 0),
        ongoing: by(ProjectStatus.Ongoing),
        hold: by(ProjectStatus.Hold),
        done: by(ProjectStatus.Done),
      };
    });
  }

  private async ordersTotal(from: Date, to: Date): Promise<number> {
    const rows = await this.orderModel.aggregate<{ total: number }>([
      { $match: { createdAt: { $gte: from, $lte: to } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return rows[0]?.total ?? 0;
  }

  private ordersCount(from: Date, to: Date): Promise<number> {
    return this.orderModel.countDocuments({ createdAt: { $gte: from, $lte: to } }).exec();
  }
}

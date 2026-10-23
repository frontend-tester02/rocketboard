// Dashboard aggregation contracts shared between web and api.
import { z } from 'zod';

export const dashboardRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
export type DashboardRangeQuery = z.infer<typeof dashboardRangeQuerySchema>;

/** A value plus its percentage change versus the previous period. */
export interface MetricDelta {
  value: number;
  /** Percentage change vs the previous equal-length period (e.g. 12.5 = +12.5%). */
  change: number;
}

export interface DashboardOverview {
  income: MetricDelta;
  sales: MetricDelta;
  newClients: MetricDelta;
}

export interface DailyIncomeExpense {
  date: string;
  income: number;
  expense: number;
}

export interface SalesPoint {
  date: string;
  total: number;
  count: number;
}

export interface TasksSummary {
  total: number;
  high: number;
  medium: number;
  low: number;
}

export interface ProjectsSummary {
  total: number;
  ongoing: number;
  hold: number;
  done: number;
}

'use client';

import { Calendar } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/common/card';
import { SelectChip } from '@/components/common/select-chip';
import { chartColors } from '@/features/dashboard/chart-theme';
import { statisticsWeekly } from '@/features/dashboard/mock';
import { ChartTooltip } from '@/features/dashboard/widgets/chart-tooltip';

function Legend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: chartColors.income }} />
        Income
      </span>
      <span className="flex items-center gap-1.5">
        <span className="size-2 rounded-full" style={{ background: chartColors.expense }} />
        Expense
      </span>
    </div>
  );
}

export function StatisticsBarChart({ stacked = false }: { stacked?: boolean }) {
  const stackId = stacked ? 'a' : undefined;
  const barSize = stacked ? 24 : 9;
  const incomeRadius = stacked
    ? ([0, 0, 0, 0] as [number, number, number, number])
    : ([8, 8, 8, 8] as [number, number, number, number]);
  const expenseRadius = stacked
    ? ([8, 8, 0, 0] as [number, number, number, number])
    : ([8, 8, 8, 8] as [number, number, number, number]);

  return (
    <Card
      title="Statistics"
      action={
        <>
          <Legend />
          <SelectChip label="19 Aug – 25 Aug" icon={Calendar} />
        </>
      }
      bodyClassName="h-[260px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={statisticsWeekly} barGap={4} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
          />
          <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltip />} />
          <Bar dataKey="income" stackId={stackId} fill={chartColors.income} radius={incomeRadius} barSize={barSize} />
          <Bar dataKey="expense" stackId={stackId} fill={chartColors.expense} radius={expenseRadius} barSize={barSize} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

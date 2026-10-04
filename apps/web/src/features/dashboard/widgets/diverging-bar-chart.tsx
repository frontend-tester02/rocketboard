'use client';

import { Calendar } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/common/card';
import { SelectChip } from '@/components/common/select-chip';
import { chartColors } from '@/features/dashboard/chart-theme';
import { diverging } from '@/features/dashboard/mock';
import { ChartTooltip } from '@/features/dashboard/widgets/chart-tooltip';

// Expense extends left (negative), income extends right (positive).
const data = diverging.map((d) => ({
  label: d.label,
  income: d.income,
  expense: -d.expense,
}));

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

export function DivergingBarChart() {
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
        <BarChart
          data={data}
          layout="vertical"
          stackOffset="sign"
          barSize={12}
          margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
        >
          <CartesianGrid horizontal={false} stroke={chartColors.grid} />
          <XAxis
            type="number"
            domain={[-400, 400]}
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
            width={44}
          />
          <Tooltip
            cursor={{ fill: 'transparent' }}
            content={<ChartTooltip formatter={(v) => String(Math.abs(Number(v)))} />}
          />
          <ReferenceLine x={0} stroke={chartColors.axis} />
          <Bar dataKey="income" fill={chartColors.income} stackId="s" radius={[0, 6, 6, 0]} />
          <Bar dataKey="expense" fill={chartColors.expense} stackId="s" radius={[6, 0, 0, 6]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '@/components/common/card';
import { SelectChip } from '@/components/common/select-chip';
import { chartColors } from '@/features/dashboard/chart-theme';
import { balanceSeries } from '@/features/dashboard/mock';
import { ChartTooltip } from '@/features/dashboard/widgets/chart-tooltip';
import { formatCurrency } from '@/lib/utils';

export function BalanceLineChart() {
  return (
    <Card
      title="Balance Overview"
      action={<SelectChip label="This year" />}
      bodyClassName="h-[240px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={balanceSeries} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="fillBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColors.income} stopOpacity={0.25} />
              <stop offset="100%" stopColor={chartColors.income} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={chartColors.grid} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: chartColors.axis, fontSize: 12 }}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip
            content={<ChartTooltip formatter={(v) => formatCurrency(Number(v))} />}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={chartColors.income}
            strokeWidth={2.5}
            fill="url(#fillBalance)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

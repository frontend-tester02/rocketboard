'use client';

import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
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
import { analytics, analyticsSummary } from '@/features/dashboard/mock';
import { ChartTooltip } from '@/features/dashboard/widgets/chart-tooltip';

export function AnalyticsLineChart() {
  return (
    <Card
      title="Analytics"
      action={<SelectChip label="19 Aug – 25 Aug" icon={Calendar} />}
    >
      <div className="mb-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <TrendingUp className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">
              {analyticsSummary.revenue}
            </p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-warning/15 text-warning">
            <TrendingDown className="size-4" />
          </span>
          <div>
            <p className="text-sm font-semibold leading-none">
              {analyticsSummary.profit}
            </p>
            <p className="text-xs text-muted-foreground">Profit</p>
          </div>
        </div>
      </div>

      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={analytics} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.income} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColors.income} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColors.expense} stopOpacity={0.25} />
                <stop offset="100%" stopColor={chartColors.expense} stopOpacity={0} />
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
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke={chartColors.income}
              strokeWidth={2.5}
              fill="url(#fillRevenue)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="profit"
              stroke={chartColors.expense}
              strokeWidth={2.5}
              fill="url(#fillProfit)"
              dot={false}
              activeDot={{ r: 4 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

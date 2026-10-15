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
import { visits, visitsSummary } from '@/features/dashboard/mock';
import { ChartTooltip } from '@/features/dashboard/widgets/chart-tooltip';

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold tracking-tight">{value}</span>
    </div>
  );
}

export function VisitsAreaChart() {
  return (
    <Card title="Visits" action={<SelectChip label="Last 7 days" />}>
      <div className="mb-4 flex items-center gap-8">
        <Summary label="Min" value={visitsSummary.min} />
        <Summary label="Avg" value={visitsSummary.avg} />
        <Summary label="Max" value={visitsSummary.max} />
      </div>

      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={visits} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="fillVisitsAvg" x1="0" y1="0" x2="0" y2="1">
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
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="max"
              stroke={chartColors.expense}
              strokeWidth={2}
              fillOpacity={0}
              dot={false}
              activeDot={{ r: 3 }}
            />
            <Area
              type="monotone"
              dataKey="avg"
              stroke={chartColors.income}
              strokeWidth={2.5}
              fill="url(#fillVisitsAvg)"
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Area
              type="monotone"
              dataKey="min"
              stroke={chartColors.axis}
              strokeWidth={2}
              fillOpacity={0}
              strokeDasharray="4 4"
              dot={false}
              activeDot={{ r: 3 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

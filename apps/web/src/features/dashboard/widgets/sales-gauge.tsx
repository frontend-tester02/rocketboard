'use client';

import { Calendar, TrendingDown, TrendingUp } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/card';
import { SelectChip } from '@/components/common/select-chip';
import { chartColors } from '@/features/dashboard/chart-theme';
import { salesGauge } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

const data = [
  { name: 'Current Week', value: salesGauge.currentWeek.value, color: chartColors.expense },
  { name: 'Last Week', value: salesGauge.lastWeek.value, color: chartColors.income },
];

function LegendRow({
  label,
  color,
  value,
  change,
}: {
  label: string;
  color: string;
  value: number;
  change: number;
}) {
  const positive = change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
      <span className="ml-auto font-medium">{value.toLocaleString()}</span>
      <span
        className={cn(
          'inline-flex w-14 items-center justify-end gap-0.5 text-xs font-medium',
          positive ? 'text-success' : 'text-danger',
        )}
      >
        <Trend className="size-3" />
        {Math.abs(change)}%
      </span>
    </div>
  );
}

export function SalesGauge() {
  return (
    <Card title="Sales" menu bodyClassName="flex flex-col items-center gap-4">
      <div className="mb-1 self-end">
        <SelectChip label="19 Aug – 25 Aug" icon={Calendar} />
      </div>
      <div className="relative h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={66}
              outerRadius={88}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              cornerRadius={8}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">
            {salesGauge.total.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <LegendRow
          label="Current Week"
          color={chartColors.expense}
          value={salesGauge.currentWeek.value}
          change={salesGauge.currentWeek.change}
        />
        <LegendRow
          label="Last Week"
          color={chartColors.income}
          value={salesGauge.lastWeek.value}
          change={salesGauge.lastWeek.change}
        />
      </div>
    </Card>
  );
}

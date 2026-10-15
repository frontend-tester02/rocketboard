'use client';

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
import { followersGrowth } from '@/features/dashboard/mock';
import { ChartTooltip } from '@/features/dashboard/widgets/chart-tooltip';

export function FollowersGrowthBars() {
  return (
    <Card
      title="Followers Growth"
      action={<SelectChip label="Last 6 months" />}
      bodyClassName="h-[240px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={followersGrowth} margin={{ top: 8, right: 0, left: -16, bottom: 0 }}>
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
          <Tooltip cursor={{ fill: 'transparent' }} content={<ChartTooltip />} />
          <Bar dataKey="value" fill={chartColors.income} radius={[8, 8, 8, 8]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

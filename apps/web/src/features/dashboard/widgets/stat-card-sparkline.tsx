'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { chartColors } from '@/features/dashboard/chart-theme';
import type { SparkStat } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

export function StatCardSparkline({ stat }: { stat: SparkStat }) {
  const positive = stat.change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;
  const color = stat.color === 'income' ? chartColors.income : chartColors.expense;
  const data = stat.data.map((v, i) => ({ i, v }));
  const gradientId = `spark-${stat.key}`;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">{stat.value}</p>
        <span
          className={cn(
            'mt-1 inline-flex items-center gap-0.5 text-xs font-medium',
            positive ? 'text-success' : 'text-danger',
          )}
        >
          <Trend className="size-3.5" />
          {Math.abs(stat.change)}%
        </span>
      </div>
      <div className="h-14 w-24 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

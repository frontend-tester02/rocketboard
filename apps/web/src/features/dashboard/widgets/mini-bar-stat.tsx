'use client';

import { TrendingDown, TrendingUp } from 'lucide-react';
import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';
import { chartColors } from '@/features/dashboard/chart-theme';
import type { MiniBarStatItem } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

export function MiniBarStat({ stat }: { stat: MiniBarStatItem }) {
  const positive = stat.change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;
  const color = stat.color === 'income' ? chartColors.income : chartColors.expense;
  const data = stat.data.map((v, i) => ({ i, v }));
  const peak = Math.max(...stat.data);

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
          <BarChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <Bar dataKey="v" radius={[3, 3, 3, 3]} barSize={6}>
              {data.map((d) => (
                <Cell
                  key={d.i}
                  fill={color}
                  fillOpacity={d.v === peak ? 1 : 0.25}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

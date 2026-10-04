import {
  BarChart3,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { StatItem } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

const icons: Record<StatItem['icon'], LucideIcon> = {
  income: DollarSign,
  sales: BarChart3,
  clients: Users,
};

export function StatCard({ stat }: { stat: StatItem }) {
  const Icon = icons[stat.icon];
  const positive = stat.change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">
            {stat.value}
          </span>
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-medium',
              positive ? 'text-success' : 'text-danger',
            )}
          >
            <Trend className="size-3.5" />
            {Math.abs(stat.change)}%
          </span>
        </div>
      </div>
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning">
        <Icon className="size-6" />
      </span>
    </div>
  );
}

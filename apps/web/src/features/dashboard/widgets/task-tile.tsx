import {
  CheckCircle2,
  Layers,
  Loader,
  Plus,
  TrendingDown,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';
import type { TaskTileIcon, TaskTileItem } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

const meta: Record<TaskTileIcon, { icon: LucideIcon; className: string }> = {
  total: { icon: Layers, className: 'bg-primary/10 text-primary' },
  new: { icon: Plus, className: 'bg-warning/15 text-warning' },
  progress: { icon: Loader, className: 'bg-danger/10 text-danger' },
  done: { icon: CheckCircle2, className: 'bg-success/10 text-success' },
};

export function TaskTile({ tile }: { tile: TaskTileItem }) {
  const { icon: Icon, className } = meta[tile.icon];
  const positive = tile.change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          className,
        )}
      >
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-2xl font-semibold tracking-tight">{tile.value}</p>
        <p className="text-sm text-muted-foreground">{tile.label}</p>
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs font-medium',
          positive ? 'text-success' : 'text-danger',
        )}
      >
        <Trend className="size-3.5" />
        {Math.abs(tile.change)}%
      </span>
    </div>
  );
}

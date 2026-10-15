import {
  Eye,
  Heart,
  MessageCircle,
  TrendingDown,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { SocialStatIcon, SocialStatItem } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

const meta: Record<SocialStatIcon, { icon: LucideIcon; className: string }> = {
  visitors: { icon: Eye, className: 'bg-primary/10 text-primary' },
  followers: { icon: Users, className: 'bg-warning/15 text-warning' },
  likes: { icon: Heart, className: 'bg-danger/10 text-danger' },
  comments: { icon: MessageCircle, className: 'bg-success/10 text-success' },
};

export function SocialStatCard({ stat }: { stat: SocialStatItem }) {
  const { icon: Icon, className } = meta[stat.icon];
  const positive = stat.change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-xl',
          className,
        )}
      >
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="text-sm text-muted-foreground">{stat.label}</p>
        <div className="mt-0.5 flex items-baseline gap-2">
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
    </div>
  );
}

import { cn } from '@/lib/utils';

export type StatusVariant = 'success' | 'warning' | 'danger' | 'neutral';

const styles: Record<StatusVariant, string> = {
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/15 text-warning',
  danger: 'bg-danger/10 text-danger',
  neutral: 'bg-muted text-muted-foreground',
};

const dot: Record<StatusVariant, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  neutral: 'bg-muted-foreground',
};

/** Pill status indicator with a colored dot. */
export function StatusBadge({
  variant = 'neutral',
  children,
  className,
  showDot = true,
}: {
  variant?: StatusVariant;
  children: React.ReactNode;
  className?: string;
  showDot?: boolean;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        styles[variant],
        className,
      )}
    >
      {showDot && <span className={cn('size-1.5 rounded-full', dot[variant])} />}
      {children}
    </span>
  );
}

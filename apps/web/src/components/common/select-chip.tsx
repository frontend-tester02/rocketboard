import { ChevronDown, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Presentational pill button used for header controls like "19 Aug – 25 Aug"
 * or "Last 7 days". The real date-range / period pickers arrive in S6.
 */
export function SelectChip({
  label,
  icon: Icon,
  className,
}: {
  label: string;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground',
        className,
      )}
    >
      {Icon && <Icon className="size-3.5" />}
      <span>{label}</span>
      <ChevronDown className="size-3.5" />
    </button>
  );
}

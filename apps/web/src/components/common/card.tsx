import { MoreHorizontal } from 'lucide-react';
import type { ReactNode } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface CardProps {
  title?: ReactNode;
  /** Right-aligned header content (e.g. a date chip or legend). */
  action?: ReactNode;
  /** Show the default "..." overflow menu on the right of the header. */
  menu?: boolean;
  className?: string;
  bodyClassName?: string;
  children?: ReactNode;
}

/** Surface container with an optional titled header, action slot and "..." menu. */
export function Card({
  title,
  action,
  menu,
  className,
  bodyClassName,
  children,
}: CardProps) {
  const hasHeader = title != null || action != null || menu;
  return (
    <section
      className={cn(
        'rounded-xl border border-border/60 bg-card p-5 shadow-sm',
        className,
      )}
    >
      {hasHeader && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title != null ? (
            <h3 className="text-base font-semibold text-foreground">{title}</h3>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-2">
            {action}
            {menu && <CardMenu />}
          </div>
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

/** Default "..." overflow menu used in card headers. */
export function CardMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="More options"
      >
        <MoreHorizontal className="size-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>View details</DropdownMenuItem>
        <DropdownMenuItem>Refresh</DropdownMenuItem>
        <DropdownMenuItem>Export</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

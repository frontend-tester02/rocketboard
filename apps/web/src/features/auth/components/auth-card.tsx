import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** White auth card used by every auth screen. */
export function AuthCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'w-full max-w-[400px] rounded-2xl bg-card p-8 shadow-xl sm:p-10',
        className,
      )}
    >
      {children}
    </div>
  );
}

import { Rocket } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function SidebarBrand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className={cn(
        'flex h-16 items-center gap-2 border-b border-border px-5',
        collapsed && 'justify-center px-2',
      )}
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Rocket className="size-5" />
      </span>
      {!collapsed && (
        <span className="text-lg font-semibold tracking-tight">Rocket</span>
      )}
    </Link>
  );
}

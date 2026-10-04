'use client';

import { SidebarBrand } from '@/components/layout/sidebar-brand';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useSidebarStore } from '@/store/sidebar-store';
import { cn } from '@/lib/utils';

/** Desktop sidebar: full (w-64) or icon-rail (w-[72px]). Hidden on mobile. */
export function AppSidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex',
          collapsed ? 'w-[72px]' : 'w-64',
        )}
      >
        <SidebarBrand collapsed={collapsed} />
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
      </aside>
    </TooltipProvider>
  );
}

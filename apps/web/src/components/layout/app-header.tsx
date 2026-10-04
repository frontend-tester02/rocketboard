'use client';

import { Bell, Menu, PanelLeft, Search } from 'lucide-react';
import { UserMenu } from '@/components/layout/user-menu';
import { useSidebarStore } from '@/store/sidebar-store';

export function AppHeader() {
  const toggleCollapsed = useSidebarStore((s) => s.toggleCollapsed);
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur">
      {/* Mobile: open drawer */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Desktop: collapse / expand sidebar */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="hidden size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:inline-flex"
        aria-label="Toggle sidebar"
      >
        <PanelLeft className="size-5" />
      </button>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Search"
        >
          <Search className="size-5" />
        </button>
        <button
          type="button"
          className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-danger ring-2 ring-card" />
        </button>
        <UserMenu />
      </div>
    </header>
  );
}

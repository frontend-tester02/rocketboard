'use client';

import { ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { navItems, type NavItem } from '@/components/layout/nav-config';
import { useSidebarStore } from '@/store/sidebar-store';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function itemActive(pathname: string, item: NavItem): boolean {
  if (isActive(pathname, item.href)) return true;
  return (item.children ?? []).some((c) => isActive(pathname, c.href));
}

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const setCollapsed = useSidebarStore((s) => s.setCollapsed);

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {navItems.map((item) =>
        item.children ? (
          <NavGroup
            key={item.label}
            item={item}
            collapsed={collapsed}
            pathname={pathname}
            expandSidebar={() => setCollapsed(false)}
            onNavigate={onNavigate}
          />
        ) : (
          <NavLink
            key={item.label}
            item={item}
            collapsed={collapsed}
            active={itemActive(pathname, item)}
            onNavigate={onNavigate}
          />
        ),
      )}
    </nav>
  );
}

const rowBase =
  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors [&_svg]:size-5 [&_svg]:shrink-0';

function NavLink({
  item,
  collapsed,
  active,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const link = (
    <Link
      href={item.href ?? '#'}
      onClick={onNavigate}
      className={cn(
        rowBase,
        'relative',
        collapsed && 'justify-center px-2',
        active
          ? 'bg-primary/10 font-semibold text-primary'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
      aria-current={active ? 'page' : undefined}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
      )}
      <span className="relative">
        <Icon />
        {collapsed && item.badge ? (
          <span className="absolute -right-1 -top-1 size-2 rounded-full bg-danger ring-2 ring-card" />
        ) : null}
      </span>
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.badge ? (
        <Badge variant={item.badgeVariant === 'danger' ? 'danger' : 'default'}>
          {item.badge}
        </Badge>
      ) : null}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

function NavGroup({
  item,
  collapsed,
  pathname,
  expandSidebar,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  expandSidebar: () => void;
  onNavigate?: () => void;
}) {
  const Icon = item.icon;
  const groupActive = itemActive(pathname, item);
  const [open, setOpen] = useState(groupActive);

  const trigger = (
    <button
      type="button"
      onClick={() => {
        if (collapsed) {
          expandSidebar();
          setOpen(true);
        } else {
          setOpen((o) => !o);
        }
      }}
      className={cn(
        rowBase,
        'w-full',
        collapsed && 'justify-center px-2',
        groupActive
          ? 'text-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
      )}
      aria-expanded={!collapsed && open}
    >
      <Icon />
      {!collapsed && <span className="flex-1 truncate text-left">{item.label}</span>}
      {!collapsed && (
        <ChevronDown
          className={cn('transition-transform', open && 'rotate-180')}
        />
      )}
    </button>
  );

  return (
    <div>
      {collapsed ? (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}

      {!collapsed && open && (
        <div className="mt-1 flex flex-col gap-1 pl-11">
          {item.children?.map((child) => {
            const active = isActive(pathname, child.href);
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm transition-colors',
                  active
                    ? 'font-medium text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                aria-current={active ? 'page' : undefined}
              >
                {child.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

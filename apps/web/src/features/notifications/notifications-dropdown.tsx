'use client';

import {
  Bell,
  CheckCheck,
  FileText,
  MessageSquare,
  Package,
  SquareCheck,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  notifications as seed,
  type NotificationType,
} from '@/features/notifications/mock';
import { cn } from '@/lib/utils';

const typeMeta: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  message: { icon: MessageSquare, className: 'bg-primary/10 text-primary' },
  task: { icon: SquareCheck, className: 'bg-success/10 text-success' },
  order: { icon: Package, className: 'bg-warning/15 text-warning' },
  file: { icon: FileText, className: 'bg-danger/10 text-danger' },
  mention: { icon: MessageSquare, className: 'bg-primary/10 text-primary' },
};

export function NotificationsDropdown() {
  const [items, setItems] = useState(seed);
  const unread = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  }

  return (
    <Popover>
      <PopoverTrigger
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-semibold leading-4 text-white ring-2 ring-card">
            {unread}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">Notifications</h3>
            {unread > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {unread} new
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={markAllRead}
            disabled={unread === 0}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80 disabled:text-muted-foreground"
          >
            <CheckCheck className="size-3.5" />
            Mark all as read
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {items.map((n) => {
            const { icon: Icon, className } = typeMeta[n.type];
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => markRead(n.id)}
                className={cn(
                  'flex w-full items-start gap-3 border-b border-border/60 px-4 py-3 text-left transition-colors hover:bg-accent',
                  !n.read && 'bg-primary/[0.03]',
                )}
              >
                {n.actor ? (
                  <UserAvatar name={n.actor} className="size-9" />
                ) : (
                  <span
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full',
                      className,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{n.title}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {n.description}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {n.time}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        <div className="border-t border-border p-2">
          <button
            type="button"
            className="w-full rounded-md py-2 text-center text-sm font-medium text-primary transition-colors hover:bg-accent"
          >
            View all notifications
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

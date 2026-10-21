'use client';

import type { LucideIcon } from 'lucide-react';
import { Fragment, type ComponentType } from 'react';
import { cn } from '@/lib/utils';

export interface MenuAction {
  key: string;
  label: string;
  icon: LucideIcon;
  onSelect: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

interface ItemProps {
  onSelect?: (e: Event) => void;
  className?: string;
  children: React.ReactNode;
}

/**
 * Renders a shared list of actions with whichever menu primitives are passed —
 * so the "…" dropdown and the right-click context menu show the same items.
 */
export function ItemMenuActions({
  actions,
  Item,
  Separator,
}: {
  actions: MenuAction[];
  Item: ComponentType<ItemProps>;
  Separator: ComponentType<Record<string, never>>;
}) {
  return (
    <>
      {actions.map((a) => (
        <Fragment key={a.key}>
          {a.separatorBefore && <Separator />}
          <Item
            onSelect={() => a.onSelect()}
            className={cn(a.danger && 'text-danger focus:text-danger')}
          >
            <a.icon className="size-4" />
            {a.label}
          </Item>
        </Fragment>
      ))}
    </>
  );
}

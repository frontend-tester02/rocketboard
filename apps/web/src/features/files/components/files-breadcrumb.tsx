'use client';

import type { Breadcrumb } from '@rocket/shared';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function FilesBreadcrumb({ trail }: { trail: Breadcrumb[] }) {
  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        href="/files"
        className={cn(
          'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors',
          trail.length === 0 ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        )}
      >
        <Home className="size-4" />
        My Files
      </Link>
      {trail.map((c, i) => {
        const last = i === trail.length - 1;
        return (
          <span key={c.id} className="flex items-center gap-1">
            <ChevronRight className="size-4 text-muted-foreground" />
            {last ? (
              <span className="rounded-md px-2 py-1 font-medium text-foreground">{c.name}</span>
            ) : (
              <Link
                href={`/files/${c.id}`}
                className="rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.name}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}

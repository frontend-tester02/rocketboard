'use client';

import type { StorageKind, StorageUsage } from '@rocket/shared';
import { HardDrive } from 'lucide-react';
import { kindMeta, formatBytes } from '@/features/files/file-meta';
import { cn } from '@/lib/utils';

const ORDER: StorageKind[] = ['images', 'documents', 'videos', 'audio', 'other'];

export function StorageWidget({ storage }: { storage?: StorageUsage }) {
  if (!storage) {
    return <div className="h-48 animate-pulse rounded-xl border border-border/60 bg-card" />;
  }
  const { used, total, byKind } = storage;
  const percent = total ? Math.min(100, (used / total) * 100) : 0;
  const kinds = ORDER.filter((k) => byKind[k]?.count > 0);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <HardDrive className="size-5" />
        </span>
        <div>
          <p className="text-sm font-semibold">Storage</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(used)} of {formatBytes(total)} used
          </p>
        </div>
      </div>

      {/* Segmented usage bar */}
      <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
        {kinds.map((k) => {
          const w = total ? (byKind[k].size / total) * 100 : 0;
          return <div key={k} className={cn('h-full', kindMeta[k].bar)} style={{ width: `${w}%` }} />;
        })}
      </div>
      <p className="mt-1.5 text-right text-xs text-muted-foreground">{percent.toFixed(1)}% used</p>

      {/* Legend */}
      <ul className="mt-4 space-y-2.5">
        {ORDER.map((k) => {
          const meta = kindMeta[k];
          const Icon = meta.icon;
          return (
            <li key={k} className="flex items-center gap-3">
              <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', meta.tint)}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{meta.label}</p>
                <p className="text-xs text-muted-foreground">{byKind[k].count} files</p>
              </div>
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {formatBytes(byKind[k].size)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

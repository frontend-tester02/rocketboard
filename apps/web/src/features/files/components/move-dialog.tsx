'use client';

import { ChevronRight, Folder, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useFolderContents } from '@/features/files/hooks';
import { cn } from '@/lib/utils';

/** Pick a destination folder by navigating the folder tree. */
export function MoveDialog({
  open,
  onOpenChange,
  itemName,
  excludeFolderId,
  currentParent,
  onMove,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  itemName: string;
  /** Folder being moved — can't be its own destination. */
  excludeFolderId?: string;
  /** Where the item currently lives (disabled as a no-op target). */
  currentParent: string | null;
  onMove: (destFolderId: string | null) => void;
}) {
  const [browseId, setBrowseId] = useState<string | undefined>(undefined);
  const contents = useFolderContents(browseId);

  useEffect(() => {
    if (open) setBrowseId(undefined);
  }, [open]);

  const here = browseId ?? null;
  const isSameAsCurrent = here === currentParent;
  const trail = contents.data?.breadcrumbs ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Move “{itemName}”</DialogTitle>
        </DialogHeader>

        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <button
            type="button"
            onClick={() => setBrowseId(undefined)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors',
              browseId === undefined ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Home className="size-4" />
            My Files
          </button>
          {trail.map((c) => (
            <span key={c.id} className="flex items-center gap-1">
              <ChevronRight className="size-4 text-muted-foreground" />
              <button
                type="button"
                onClick={() => setBrowseId(c.id)}
                className="rounded-md px-2 py-1 font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {c.name}
              </button>
            </span>
          ))}
        </div>

        {/* Folder list */}
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border/60 p-1.5">
          {contents.isLoading ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Loading…</p>
          ) : contents.data && contents.data.folders.length > 0 ? (
            contents.data.folders.map((f) => {
              const disabled = f.id === excludeFolderId;
              return (
                <button
                  key={f.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => setBrowseId(f.id)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm transition-colors',
                    disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-accent',
                  )}
                >
                  <Folder className="size-4 text-primary" />
                  <span className="flex-1 truncate">{f.name}</span>
                  {!disabled && <ChevronRight className="size-4 text-muted-foreground" />}
                </button>
              );
            })
          ) : (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">No subfolders here.</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={isSameAsCurrent}
            onClick={() => {
              onMove(here);
              onOpenChange(false);
            }}
          >
            {isSameAsCurrent ? 'Already here' : 'Move here'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

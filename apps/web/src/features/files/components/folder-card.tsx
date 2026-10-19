'use client';

import type { FolderDto } from '@rocket/shared';
import { Folder, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function FolderCard({
  folder,
  onOpen,
  onRename,
  onDelete,
}: {
  folder: FolderDto;
  onOpen: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const color = folder.color || '#3E4DF5';
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-lg"
        style={{ background: `${color}1a`, color }}
      >
        <Folder className="size-5" fill="currentColor" fillOpacity={0.15} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{folder.name}</p>
        <p className="text-xs text-muted-foreground">{folder.fileCount} items</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={(e) => e.stopPropagation()}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
          aria-label="Folder actions"
        >
          <MoreVertical className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem onSelect={onRename}>
            <Pencil className="size-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-danger focus:text-danger" onSelect={onDelete}>
            <Trash2 className="size-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </button>
  );
}

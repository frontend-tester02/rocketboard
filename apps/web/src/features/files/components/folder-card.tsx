'use client';

import type { FolderDto } from '@rocket/shared';
import { FolderOpen, Folder, FolderInput, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemMenuActions, type MenuAction } from '@/features/files/components/item-menu';

export function FolderCard({
  folder,
  onOpen,
  onRename,
  onMove,
  onDelete,
}: {
  folder: FolderDto;
  onOpen: () => void;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
}) {
  const color = folder.color || '#3E4DF5';

  const actions: MenuAction[] = [
    { key: 'open', label: 'Open', icon: FolderOpen, onSelect: onOpen },
    { key: 'rename', label: 'Rename', icon: Pencil, onSelect: onRename },
    { key: 'move', label: 'Move', icon: FolderInput, onSelect: onMove },
    { key: 'delete', label: 'Delete', icon: Trash2, onSelect: onDelete, danger: true, separatorBefore: true },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <button
          type="button"
          onClick={onOpen}
          onDoubleClick={onOpen}
          className="group flex w-full items-center gap-3 rounded-xl border border-border/60 bg-card p-3.5 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-accent/40"
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
              <ItemMenuActions actions={actions} Item={DropdownMenuItem} Separator={DropdownMenuSeparator} />
            </DropdownMenuContent>
          </DropdownMenu>
        </button>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ItemMenuActions actions={actions} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

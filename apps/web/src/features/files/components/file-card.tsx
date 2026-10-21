'use client';

import type { FileDto } from '@rocket/shared';
import { format } from 'date-fns';
import {
  Download,
  ExternalLink,
  FolderInput,
  MoreVertical,
  Pencil,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';
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
import { fileIcon, fileTint, formatBytes, isImage } from '@/features/files/file-meta';
import { ItemMenuActions, type MenuAction } from '@/features/files/components/item-menu';
import { cn } from '@/lib/utils';

export function FileCard({
  file,
  onOpen,
  onDownload,
  onRename,
  onMove,
  onShare,
  onToggleStar,
  onDelete,
}: {
  file: FileDto;
  onOpen: () => void;
  onDownload: () => void;
  onRename: () => void;
  onMove: () => void;
  onShare: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
}) {
  const Icon = fileIcon(file.mimeType);

  const actions: MenuAction[] = [
    { key: 'open', label: 'Open', icon: ExternalLink, onSelect: onOpen },
    { key: 'download', label: 'Download', icon: Download, onSelect: onDownload },
    { key: 'rename', label: 'Rename', icon: Pencil, onSelect: onRename },
    { key: 'move', label: 'Move', icon: FolderInput, onSelect: onMove },
    { key: 'share', label: 'Share', icon: Share2, onSelect: onShare },
    { key: 'star', label: file.isStarred ? 'Unstar' : 'Star', icon: Star, onSelect: onToggleStar },
    { key: 'delete', label: 'Delete', icon: Trash2, onSelect: onDelete, danger: true, separatorBefore: true },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          onDoubleClick={onOpen}
          className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-colors hover:border-primary/40"
        >
          {/* Preview */}
          <div className="relative flex h-28 items-center justify-center bg-muted/40">
            {isImage(file.mimeType) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
            ) : (
              <span className={cn('flex size-12 items-center justify-center rounded-xl', fileTint(file.mimeType))}>
                <Icon className="size-6" />
              </span>
            )}

            <button
              type="button"
              onClick={onToggleStar}
              className={cn(
                'absolute left-2 top-2 inline-flex size-7 items-center justify-center rounded-md bg-card/80 backdrop-blur transition-colors',
                file.isStarred ? 'text-warning' : 'text-muted-foreground opacity-0 hover:text-foreground group-hover:opacity-100',
              )}
              aria-label={file.isStarred ? 'Unstar' : 'Star'}
            >
              <Star className="size-4" fill={file.isStarred ? 'currentColor' : 'none'} />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="absolute right-2 top-2 inline-flex size-7 items-center justify-center rounded-md bg-card/80 text-muted-foreground opacity-0 outline-none backdrop-blur transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                aria-label="File actions"
              >
                <MoreVertical className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ItemMenuActions actions={actions} Item={DropdownMenuItem} Separator={DropdownMenuSeparator} />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2.5 p-3">
            <span className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', fileTint(file.mimeType))}>
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
                {file.createdAt && ` · ${format(new Date(file.createdAt), 'd MMM yyyy')}`}
              </p>
            </div>
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ItemMenuActions actions={actions} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

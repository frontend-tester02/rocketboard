'use client';

import type { FileDto } from '@rocket/shared';
import { format } from 'date-fns';
import { Download, MoreVertical, Pencil, Star, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { fileIcon, fileTint, formatBytes, isImage } from '@/features/files/file-meta';
import { cn } from '@/lib/utils';

export function FileCard({
  file,
  onDownload,
  onRename,
  onToggleStar,
  onDelete,
}: {
  file: FileDto;
  onDownload: () => void;
  onRename: () => void;
  onToggleStar: () => void;
  onDelete: () => void;
}) {
  const Icon = fileIcon(file.mimeType);
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm transition-colors hover:border-primary/40">
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
            <DropdownMenuItem onSelect={onDownload}>
              <Download className="size-4" />
              Download
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onRename}>
              <Pencil className="size-4" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onToggleStar}>
              <Star className="size-4" />
              {file.isStarred ? 'Unstar' : 'Star'}
            </DropdownMenuItem>
            <DropdownMenuItem className="text-danger focus:text-danger" onSelect={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
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
  );
}

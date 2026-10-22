'use client';

import type { NoteDto } from '@rocket/shared';
import { format } from 'date-fns';
import { MoreVertical, Pin, PinOff, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { noteColor } from '@/features/notes/note-colors';
import { cn } from '@/lib/utils';

/** Plain-text preview from (possibly) HTML content. */
function toPreview(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function NoteCard({
  note,
  onOpen,
  onTogglePin,
  onDelete,
}: {
  note: NoteDto;
  onOpen: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const color = noteColor(note.color);
  const preview = toPreview(note.content);

  return (
    <div
      className={cn(
        'group flex break-inside-avoid flex-col gap-2 rounded-xl border p-4 shadow-sm transition-colors',
        color.cardClass,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
          <h3 className="truncate font-semibold">
            {note.title?.trim() || 'Untitled'}
          </h3>
        </button>
        <div className="flex shrink-0 items-center gap-0.5">
          {note.isPinned && <Pin className="size-3.5 text-muted-foreground" fill="currentColor" />}
          <DropdownMenu>
            <DropdownMenuTrigger
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-black/5 focus-visible:opacity-100 group-hover:opacity-100 dark:hover:bg-white/10"
              aria-label="Note actions"
            >
              <MoreVertical className="size-4" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={onTogglePin}>
                {note.isPinned ? <PinOff className="size-4" /> : <Pin className="size-4" />}
                {note.isPinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-danger focus:text-danger" onSelect={onDelete}>
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <button type="button" onClick={onOpen} className="text-left">
        {preview ? (
          <p className="line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">{preview}</p>
        ) : (
          <p className="text-sm italic text-muted-foreground/60">Empty note</p>
        )}
      </button>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-black/5 px-2 py-0.5 text-xs text-muted-foreground dark:bg-white/10"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {note.updatedAt && (
        <p className="mt-0.5 text-xs text-muted-foreground/70">
          {format(new Date(note.updatedAt), 'd MMM yyyy')}
        </p>
      )}
    </div>
  );
}

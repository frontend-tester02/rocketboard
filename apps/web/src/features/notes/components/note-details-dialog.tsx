'use client';

import type { NoteDto } from '@rocket/shared';
import { format } from 'date-fns';
import { Check, Pin, PinOff, Trash2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/features/notes/components/rich-text-editor';
import { TagInput } from '@/features/products/components/tag-input';
import { NOTE_COLORS, noteColor } from '@/features/notes/note-colors';
import { useDeleteNote, useUpdateNote } from '@/features/notes/hooks';
import { cn } from '@/lib/utils';

const AUTOSAVE_MS = 700;

function sameTags(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((t, i) => t === b[i]);
}

export function NoteDetailsDialog({
  note,
  open,
  onOpenChange,
}: {
  note: NoteDto | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState('default');
  const [pinned, setPinned] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saved = useRef({ title: '', content: '', tags: [] as string[] });

  // Seed local state once per opened note.
  useEffect(() => {
    if (open && note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags);
      setColor(note.color ?? 'default');
      setPinned(note.isPinned);
      saved.current = { title: note.title, content: note.content, tags: note.tags };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, note?.id]);

  // Debounced autosave for the text fields.
  useEffect(() => {
    if (!open || !note) return;
    const s = saved.current;
    if (title === s.title && content === s.content && sameTags(tags, s.tags)) return;
    const timer = setTimeout(() => {
      saved.current = { title, content, tags };
      updateNote.mutate({ id: note.id, input: { title, content, tags } });
    }, AUTOSAVE_MS);
    return () => clearTimeout(timer);
  }, [title, content, tags, open, note, updateNote]);

  function togglePin() {
    if (!note) return;
    setPinned((p) => !p);
    updateNote.mutate({ id: note.id, input: { isPinned: !pinned } });
  }

  function pickColor(id: string) {
    if (!note) return;
    setColor(id);
    updateNote.mutate({ id: note.id, input: { color: id } });
  }

  const dirty =
    note != null &&
    (title !== saved.current.title || content !== saved.current.content || !sameTags(tags, saved.current.tags));

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className={cn('max-w-xl gap-0 border p-0', noteColor(color).cardClass)}>
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-2 border-b border-border/40 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => pickColor(c.id)}
                  aria-label={c.label}
                  className={cn(
                    'relative inline-flex size-5 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform hover:scale-110 dark:ring-white/15',
                    c.dotClass,
                  )}
                >
                  {color === c.id && <Check className="size-3 text-foreground" />}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={togglePin}
                aria-label={pinned ? 'Unpin' : 'Pin'}
                className={cn(
                  'inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-black/5 dark:hover:bg-white/10',
                  pinned ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {pinned ? <Pin className="size-4" fill="currentColor" /> : <PinOff className="size-4" />}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete"
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-black/5 hover:text-danger dark:hover:bg-white/10"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-3 px-4 py-3">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="border-0 bg-transparent px-0 text-lg font-semibold shadow-none focus-visible:ring-0"
            />
            <RichTextEditor value={content} onChange={setContent} />
            <TagInput value={tags} onChange={setTags} placeholder="Add a tag…" className="bg-transparent" />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-2 border-t border-border/40 px-4 py-2 text-xs text-muted-foreground">
            <span>
              {updateNote.isPending || dirty ? 'Saving…' : 'All changes saved'}
            </span>
            {note?.updatedAt && <span>Edited {format(new Date(note.updatedAt), 'd MMM yyyy, HH:mm')}</span>}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete note?"
        description={note ? `“${note.title?.trim() || 'Untitled'}” will be permanently removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          note &&
          deleteNote.mutate(note.id, {
            onSuccess: () => onOpenChange(false),
            onSettled: () => setConfirmDelete(false),
          })
        }
      />
    </>
  );
}

'use client';

import { Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/features/notes/components/rich-text-editor';
import { NOTE_COLORS } from '@/features/notes/note-colors';
import { useCreateNote } from '@/features/notes/hooks';
import { TagInput } from '@/features/products/components/tag-input';
import { cn } from '@/lib/utils';

export function AddNoteModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const createNote = useCreateNote();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [color, setColor] = useState('default');

  // Reset the form each time the modal opens.
  useEffect(() => {
    if (open) {
      setTitle('');
      setContent('');
      setTags([]);
      setColor('default');
    }
  }, [open]);

  function submit() {
    createNote.mutate(
      { title, content, tags, color, isPinned: false },
      { onSuccess: () => onOpenChange(false) },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="text-base font-medium"
            autoFocus
          />
          <RichTextEditor value={content} onChange={setContent} />
          <TagInput value={tags} onChange={setTags} placeholder="Add a tag…" />

          {/* Color */}
          <div className="flex items-center gap-1.5">
            <span className="mr-1 text-sm text-muted-foreground">Color</span>
            {NOTE_COLORS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setColor(c.id)}
                aria-label={c.label}
                className={cn(
                  'inline-flex size-5 items-center justify-center rounded-full ring-1 ring-black/10 transition-transform hover:scale-110 dark:ring-white/15',
                  c.dotClass,
                )}
              >
                {color === c.id && <Check className="size-3 text-foreground" />}
              </button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={createNote.isPending}>
            {createNote.isPending ? 'Creating…' : 'Create note'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

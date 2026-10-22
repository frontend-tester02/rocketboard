'use client';

import type { NoteDto } from '@rocket/shared';
import { Plus, StickyNote } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { NoteCard } from '@/features/notes/components/note-card';
import { NoteDetailsDialog } from '@/features/notes/components/note-details-dialog';
import {
  useCreateNote,
  useDeleteNote,
  useNoteTags,
  useNotes,
  useUpdateNote,
} from '@/features/notes/hooks';
import { cn } from '@/lib/utils';

const masonry = 'columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4 [&>*]:mb-4';

export function NotesPageClient() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [toDelete, setToDelete] = useState<NoteDto | null>(null);
  const [active, setActive] = useState<NoteDto | null>(null);

  const notesQuery = useNotes({ search: search || undefined, tag });
  const tagsQuery = useNoteTags();
  const createNote = useCreateNote();
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();

  const notes = notesQuery.data ?? [];
  const pinned = notes.filter((n) => n.isPinned);
  const others = notes.filter((n) => !n.isPinned);
  const tags = tagsQuery.data ?? [];

  function createAndOpen() {
    createNote.mutate({}, { onSuccess: (note) => setActive(note) });
  }

  function renderCard(note: NoteDto) {
    return (
      <NoteCard
        key={note.id}
        note={note}
        onOpen={() => setActive(note)}
        onTogglePin={() => updateNote.mutate({ id: note.id, input: { isPinned: !note.isPinned } })}
        onDelete={() => setToDelete(note)}
      />
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Notes"
        actions={
          <Button className="gap-1.5" onClick={createAndOpen} disabled={createNote.isPending}>
            <Plus className="size-4" />
            New Note
          </Button>
        }
      />

      {/* Toolbar: search + tag filters */}
      <div className="flex flex-col gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search notes…" />
        {tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <TagChip active={tag === undefined} onClick={() => setTag(undefined)}>
              All
            </TagChip>
            {tags.map((t) => (
              <TagChip key={t} active={tag === t} onClick={() => setTag(tag === t ? undefined : t)}>
                #{t}
              </TagChip>
            ))}
          </div>
        )}
      </div>

      {/* Content */}
      {notesQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : notes.length === 0 ? (
        <EmptyState
          icon={StickyNote}
          title={search || tag ? 'No matching notes' : 'No notes yet'}
          description={search || tag ? 'Try a different search or tag.' : 'Create your first note to get started.'}
          action={
            !search && !tag ? (
              <Button className="gap-1.5" onClick={createAndOpen}>
                <Plus className="size-4" />
                New Note
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {pinned.length > 0 && (
            <section>
              <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Pinned
              </h2>
              <div className={masonry}>{pinned.map(renderCard)}</div>
            </section>
          )}
          {others.length > 0 && (
            <section>
              {pinned.length > 0 && (
                <h2 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Others
                </h2>
              )}
              <div className={masonry}>{others.map(renderCard)}</div>
            </section>
          )}
        </div>
      )}

      <NoteDetailsDialog
        note={active}
        open={active !== null}
        onOpenChange={(o) => !o && setActive(null)}
      />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete note?"
        description={toDelete ? `“${toDelete.title?.trim() || 'Untitled'}” will be permanently removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => toDelete && deleteNote.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </div>
  );
}

function TagChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary/10 text-primary'
          : 'border-border/60 text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

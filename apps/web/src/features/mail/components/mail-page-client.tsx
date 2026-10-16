'use client';

import type { MailDto, MailLabelDto } from '@rocket/shared';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Palette,
  Pencil,
  PenSquare,
  Search,
  Tag,
  Trash2,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { SearchInput } from '@/components/common/search-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AddLabelModal } from '@/features/mail/components/add-label-modal';
import { ComposeMail } from '@/features/mail/components/compose-mail';
import { MailList } from '@/features/mail/components/mail-list';
import { MailReader } from '@/features/mail/components/mail-reader';
import { folders } from '@/features/mail/mail-meta';
import {
  useDeleteLabel,
  useDeleteMail,
  useLabels,
  useMailCounts,
  useMails,
  usePatchMail,
} from '@/features/mail/hooks';
import { useMailUrlState } from '@/features/mail/use-mail-url-state';
import { cn } from '@/lib/utils';

export function MailPageClient() {
  const { state, setParams, query } = useMailUrlState();
  const mailsQuery = useMails(query);
  const countsQuery = useMailCounts();
  const labelsQuery = useLabels();
  const patchMail = usePatchMail();
  const deleteMail = useDeleteMail();
  const deleteLabel = useDeleteLabel();

  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const [composing, setComposing] = useState(false);
  const [editingLabel, setEditingLabel] = useState<MailLabelDto | null>(null);
  const [toDeleteLabel, setToDeleteLabel] = useState<MailLabelDto | null>(null);
  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  const mails = mailsQuery.data?.data ?? [];
  const totalPages = mailsQuery.data?.meta.totalPages ?? 1;

  function openFolder(folder: string) {
    setParams({ folder, label: undefined, mail: undefined, page: undefined });
    setSelectedIds({});
  }

  function toggleStar(mail: MailDto) {
    patchMail.mutate({ id: mail.id, input: { isStarred: !mail.isStarred } });
  }

  function bulkDelete() {
    const ids = Object.entries(selectedIds).filter(([, v]) => v).map(([k]) => k);
    ids.forEach((id) => deleteMail.mutate(id));
    setSelectedIds({});
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-border/60 p-3">
        <button
          type="button"
          onClick={() => setComposing(true)}
          className="mb-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold uppercase tracking-wide text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
        >
          <PenSquare className="size-4" />
          New Message
        </button>

        <nav className="flex flex-col gap-0.5">
          {folders.map((f) => {
            const count = countsQuery.data?.[f.value];
            const active = state.folder === f.value && !state.label;
            const showCount =
              f.value === 'inbox' ? countsQuery.data?.unread : count;
            return (
              <button
                key={f.value}
                type="button"
                onClick={() => openFolder(f.value)}
                className={cn(
                  'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <f.icon className="size-4" />
                <span className="flex-1 text-left">{f.label}</span>
                {!!showCount && (
                  <span
                    className={cn(
                      'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold',
                      f.value === 'inbox'
                        ? 'bg-danger text-white'
                        : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {showCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-5 flex items-center justify-between px-3">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Labels
          </span>
          <AddLabelModal />
        </div>
        <div className="mt-1 flex flex-col gap-0.5">
          {labelsQuery.data?.length ? (
            labelsQuery.data.map((l) => (
              <div key={l.id} className="group flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setParams({ label: l.name, mail: undefined, page: undefined })
                  }
                  className={cn(
                    'flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
                    state.label === l.name
                      ? 'bg-accent font-medium text-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: l.color }} />
                  <span className="truncate">{l.name}</span>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded text-muted-foreground opacity-0 outline-none transition-opacity hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
                    aria-label={`Options for ${l.name}`}
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => setEditingLabel(l)}>
                      <Pencil className="size-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setEditingLabel(l)}>
                      <Palette className="size-4" />
                      Change color
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-danger focus:text-danger"
                      onSelect={() => setToDeleteLabel(l)}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))
          ) : (
            <p className="px-3 py-1 text-xs text-muted-foreground">
              <Tag className="mr-1 inline size-3" />
              No labels yet
            </p>
          )}
        </div>
      </aside>

      {/* Main */}
      <section className="flex min-w-0 flex-1 flex-col">
        {state.selected ? (
          <MailReader
            id={state.selected}
            onBack={() => setParams({ mail: undefined })}
            onDeleted={() => setParams({ mail: undefined })}
          />
        ) : (
          <>
            {/* Toolbar */}
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              {selectedCount > 0 ? (
                <>
                  <span className="text-sm font-medium">{selectedCount} selected</span>
                  <button
                    type="button"
                    onClick={bulkDelete}
                    className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIds({})}
                    className="ml-auto inline-flex size-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent"
                    aria-label="Clear selection"
                  >
                    <X className="size-4" />
                  </button>
                </>
              ) : (
                <div className="flex w-full items-center gap-2">
                  <Search className="size-4 text-muted-foreground" />
                  <SearchInput
                    value={state.search}
                    onChange={(v) => setParams({ search: v || undefined, page: undefined })}
                    placeholder="Search mail…"
                    className="w-full max-w-xs"
                  />
                  {totalPages > 1 && (
                    <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                      <button
                        type="button"
                        disabled={state.page <= 1}
                        onClick={() => setParams({ page: state.page - 1 })}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent disabled:opacity-40"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      <span>
                        {state.page} of {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={state.page >= totalPages}
                        onClick={() => setParams({ page: state.page + 1 })}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-accent disabled:opacity-40"
                        aria-label="Next page"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {mailsQuery.isLoading ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Loading…
                </div>
              ) : (
                <MailList
                  mails={mails}
                  folder={state.folder}
                  selectedIds={selectedIds}
                  onToggleSelect={(id, v) =>
                    setSelectedIds((p) => ({ ...p, [id]: v }))
                  }
                  onOpen={(id) => setParams({ mail: id })}
                  onToggleStar={toggleStar}
                />
              )}
            </div>
          </>
        )}
      </section>

      {/* Edit label (controlled) */}
      <AddLabelModal
        label={editingLabel}
        open={editingLabel !== null}
        onOpenChange={(o) => !o && setEditingLabel(null)}
      />

      <ConfirmDialog
        open={toDeleteLabel !== null}
        onOpenChange={(o) => !o && setToDeleteLabel(null)}
        title="Delete label?"
        description={
          toDeleteLabel
            ? `“${toDeleteLabel.name}” will be removed from all mails.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (toDeleteLabel) {
            deleteLabel.mutate(toDeleteLabel.id, {
              onSettled: () => setToDeleteLabel(null),
            });
          }
        }}
      />

      {composing && <ComposeMail onClose={() => setComposing(false)} />}
    </div>
  );
}

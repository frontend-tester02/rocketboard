'use client';

import type { ContactDto } from '@rocket/shared';
import { LayoutGrid, List, Plus, Users } from 'lucide-react';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import { Button } from '@/components/ui/button';
import { ContactCard } from '@/features/contacts/components/contact-card';
import { ContactFormModal } from '@/features/contacts/components/contact-form-modal';
import { ContactsTable } from '@/features/contacts/components/contacts-table';
import { useContacts, useDeleteContact, useUpdateContact } from '@/features/contacts/hooks';
import { cn } from '@/lib/utils';

export function ContactsPageClient() {
  const [search, setSearch] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [view, setView] = useState<'list' | 'grid'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<ContactDto | null>(null);
  const [toDelete, setToDelete] = useState<ContactDto | null>(null);

  const contactsQuery = useContacts({ search: search || undefined, favorite });
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const contacts = contactsQuery.data ?? [];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(contact: ContactDto) {
    setEditing(contact);
    setFormOpen(true);
  }
  function toggleFavorite(contact: ContactDto) {
    updateContact.mutate({ id: contact.id, input: { isFavorite: !contact.isFavorite } });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Contacts"
        actions={
          <Button className="gap-1.5" onClick={openCreate}>
            <Plus className="size-4" />
            Add Contact
          </Button>
        }
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput value={search} onChange={setSearch} placeholder="Search contacts…" className="w-full sm:max-w-xs" />
        <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background p-0.5">
          <FilterChip active={!favorite} onClick={() => setFavorite(false)}>
            All
          </FilterChip>
          <FilterChip active={favorite} onClick={() => setFavorite(true)}>
            Favorites
          </FilterChip>
        </div>

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border/60 bg-background p-0.5">
          <ViewToggle active={view === 'list'} onClick={() => setView('list')} label="List view">
            <List className="size-4" />
          </ViewToggle>
          <ViewToggle active={view === 'grid'} onClick={() => setView('grid')} label="Grid view">
            <LayoutGrid className="size-4" />
          </ViewToggle>
        </div>
      </div>

      {/* Content */}
      {contactsQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading…
        </div>
      ) : contacts.length === 0 ? (
        <EmptyState
          icon={Users}
          title={search || favorite ? 'No matching contacts' : 'No contacts yet'}
          description={search || favorite ? 'Try a different search or filter.' : 'Add your first contact to get started.'}
          action={
            !search && !favorite ? (
              <Button className="gap-1.5" onClick={openCreate}>
                <Plus className="size-4" />
                Add Contact
              </Button>
            ) : undefined
          }
        />
      ) : view === 'grid' ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {contacts.map((c) => (
            <ContactCard
              key={c.id}
              contact={c}
              onEdit={() => openEdit(c)}
              onDelete={() => setToDelete(c)}
              onToggleFavorite={() => toggleFavorite(c)}
            />
          ))}
        </div>
      ) : (
        <ContactsTable
          data={contacts}
          onEdit={openEdit}
          onDelete={setToDelete}
          onToggleFavorite={toggleFavorite}
        />
      )}

      <ContactFormModal contact={editing} open={formOpen} onOpenChange={setFormOpen} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete contact?"
        description={
          toDelete
            ? `“${`${toDelete.firstName} ${toDelete.lastName}`.trim()}” will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={() => toDelete && deleteContact.mutate(toDelete.id, { onSettled: () => setToDelete(null) })}
      />
    </div>
  );
}

function FilterChip({
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
        'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

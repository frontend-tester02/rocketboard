'use client';

import { MoreHorizontal } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar';
import { AddContactModal } from '@/features/dashboard/widgets/add-contact-modal';
import { useWalletContactsStore } from '@/features/dashboard/wallet-contacts-store';

export function WalletContactsList() {
  const contacts = useWalletContactsStore((s) => s.contacts);

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Contacts</h3>
        <AddContactModal />
      </div>

      <div className="flex flex-col gap-1">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-accent"
          >
            <UserAvatar name={contact.name} src={contact.avatar} className="size-9" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{contact.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {contact.role}
              </p>
            </div>
            <button
              type="button"
              className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              aria-label={`More options for ${contact.name}`}
            >
              <MoreHorizontal className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

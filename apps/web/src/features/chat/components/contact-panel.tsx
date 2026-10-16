'use client';

import { ConversationType, type ConversationDto } from '@rocket/shared';
import { Bell, FileText, Mail, X } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar';
import { convPartner, convTitle } from '@/features/chat/chat-utils';

export function ContactPanel({
  conversation,
  meId,
  online,
  onClose,
}: {
  conversation: ConversationDto;
  meId: string;
  online: Set<string>;
  onClose: () => void;
}) {
  const partner = convPartner(conversation, meId);
  const isTeam = conversation.type === ConversationType.Team;
  const partnerOnline = !!partner && online.has(partner.id);

  return (
    <aside className="flex w-72 shrink-0 flex-col border-l border-border/60">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold">
          {isTeam ? 'Group info' : 'Contact info'}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Identity */}
        <div className="flex flex-col items-center gap-2 border-b border-border/60 px-4 py-6 text-center">
          <UserAvatar name={convTitle(conversation, meId)} className="size-20 text-xl" />
          <p className="text-base font-semibold">{convTitle(conversation, meId)}</p>
          {isTeam ? (
            <p className="text-xs text-muted-foreground">
              {conversation.members.length} members
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {partnerOnline ? 'Online' : 'Offline'}
            </p>
          )}
          {!isTeam && partner && (
            <a
              href={`mailto:${partner.email}`}
              className="mt-1 inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
            >
              <Mail className="size-3.5" />
              {partner.email}
            </a>
          )}
        </div>

        {/* Members (team) */}
        {isTeam && (
          <div className="border-b border-border/60 px-4 py-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Members
            </p>
            <div className="flex flex-col gap-3">
              {conversation.members.map((m) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="relative">
                    <UserAvatar name={`${m.firstName} ${m.lastName}`} src={m.avatar} className="size-8" />
                    {online.has(m.id) && (
                      <span className="absolute bottom-0 right-0 size-2 rounded-full bg-success ring-2 ring-card" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {m.firstName} {m.lastName}
                      {m.id === meId && ' (you)'}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{m.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder sections */}
        <div className="px-4 py-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <FileText className="size-4" />
            Media, links & docs
          </button>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Bell className="size-4" />
            Mute notifications
          </button>
        </div>
      </div>
    </aside>
  );
}

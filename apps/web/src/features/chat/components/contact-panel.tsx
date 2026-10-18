'use client';

import { ConversationType, type ConversationDto } from '@rocket/shared';
import { Bell, Camera, Check, FileText, Loader2, Mail, Pencil, UserPlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/common/user-avatar';
import { InviteMembersModal } from '@/features/chat/components/invite-members-modal';
import { convPartner, convTitle } from '@/features/chat/chat-utils';
import { useUpdateConversation } from '@/features/chat/hooks';
import { uploadImage } from '@/features/uploads/api';

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
  const [invite, setInvite] = useState(false);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(conversation.name ?? '');
  const [avatar, setAvatar] = useState(conversation.avatar ?? '');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const updateConversation = useUpdateConversation();

  function startEdit() {
    setName(conversation.name ?? '');
    setAvatar(conversation.avatar ?? '');
    setEditing(true);
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setAvatar(res.url);
    } catch {
      toast.error('Upload failed (images only)');
    } finally {
      setUploading(false);
    }
  }

  function saveEdit() {
    updateConversation.mutate(
      { id: conversation.id, input: { name: name.trim() || undefined, avatar: avatar || undefined } },
      { onSuccess: () => setEditing(false) },
    );
  }

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
          {isTeam && editing ? (
            <>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="group relative size-20 overflow-hidden rounded-full border border-border bg-muted"
                aria-label="Upload group image"
              >
                {uploading ? (
                  <span className="flex size-full items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                  </span>
                ) : avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="size-full object-cover" />
                ) : (
                  <span className="flex size-full items-center justify-center text-muted-foreground">
                    <Camera className="size-6" />
                  </span>
                )}
                <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                  <Camera className="size-5" />
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Group name"
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-center text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <div className="mt-1 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={updateConversation.isPending}
                  className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                  {updateConversation.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                  Save
                </button>
              </div>
            </>
          ) : (
            <>
              <UserAvatar
                name={convTitle(conversation, meId)}
                src={conversation.avatar}
                className="size-20 text-xl"
              />
              <div className="flex items-center gap-1.5">
                <p className="text-base font-semibold">{convTitle(conversation, meId)}</p>
                {isTeam && (
                  <button
                    type="button"
                    onClick={startEdit}
                    aria-label="Edit group"
                    className="inline-flex size-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
                  >
                    <Pencil className="size-3.5" />
                  </button>
                )}
              </div>
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
            </>
          )}
        </div>

        {/* Members (team) */}
        {isTeam && (
          <div className="border-b border-border/60 px-4 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Members
              </p>
              <button
                type="button"
                onClick={() => setInvite(true)}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
              >
                <UserPlus className="size-3.5" />
                Add
              </button>
            </div>
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

      {isTeam && (
        <InviteMembersModal
          conversation={conversation}
          open={invite}
          onOpenChange={setInvite}
        />
      )}
    </aside>
  );
}

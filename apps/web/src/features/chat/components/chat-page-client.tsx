'use client';

import type { ConversationDto, PresenceEvent } from '@rocket/shared';
import { formatDistanceToNow } from 'date-fns';
import { Check, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { SearchInput } from '@/components/common/search-input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChatThread } from '@/features/chat/components/chat-thread';
import { convAvatarName, convTitle } from '@/features/chat/chat-utils';
import {
  useConversations,
  useCreateConversation,
  useInvalidateConversations,
  useUserSearch,
} from '@/features/chat/hooks';
import { useSocketConnection, useSocketEvent } from '@/features/chat/use-socket';
import { useMe } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

export function ChatPageClient() {
  useSocketConnection();
  const { data: me } = useMe();
  const meId = me?.id ?? '';
  const conversationsQuery = useConversations();
  const invalidateConvs = useInvalidateConversations();

  const [online, setOnline] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useSocketEvent<string[]>('presence:list', useCallback((ids) => setOnline(new Set(ids)), []));
  useSocketEvent<PresenceEvent>(
    'presence',
    useCallback((e) => {
      setOnline((prev) => {
        const n = new Set(prev);
        if (e.online) n.add(e.user);
        else n.delete(e.user);
        return n;
      });
    }, []),
  );
  useSocketEvent('message:new', useCallback(() => invalidateConvs(), [invalidateConvs]));

  const conversations = conversationsQuery.data ?? [];
  const filtered = useMemo(() => {
    if (!search.trim()) return conversations;
    const t = search.toLowerCase();
    return conversations.filter((c) => convTitle(c, meId).toLowerCase().includes(t));
  }, [conversations, search, meId]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-9rem)] overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
      {/* Conversation list */}
      <aside className="flex w-80 shrink-0 flex-col border-r border-border/60">
        <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
          <h2 className="text-base font-semibold">Messages</h2>
          <NewChat
            meId={meId}
            onCreated={(id) => {
              setSelectedId(id);
              invalidateConvs();
            }}
          />
        </div>
        <div className="border-b border-border px-3 py-2">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search chats…"
            className="w-full"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversationsQuery.isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading…</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          ) : (
            filtered.map((c) => {
              const partnerOnline =
                c.type === 'private' &&
                c.members.some((m) => m.id !== meId && online.has(m.id));
              const active = c.id === selectedId;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedId(c.id)}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors',
                    active ? 'bg-primary/5' : 'hover:bg-accent/40',
                  )}
                >
                  <div className="relative shrink-0">
                    <UserAvatar name={convAvatarName(c, meId)} className="size-10" />
                    {partnerOnline && (
                      <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-card" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{convTitle(c, meId)}</p>
                      {c.lastMessage?.createdAt && (
                        <span className="shrink-0 text-[11px] text-muted-foreground">
                          {formatDistanceToNow(new Date(c.lastMessage.createdAt), { addSuffix: false })}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-xs text-muted-foreground">
                        {c.lastMessage?.text || 'No messages yet'}
                      </p>
                      {!!c.unread && (
                        <span className="flex min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                          {c.unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Thread */}
      <section className="flex min-w-0 flex-1 flex-col">
        {selected && meId ? (
          <ChatThread conversation={selected} meId={meId} online={online} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-muted-foreground">
            <Search className="size-8 opacity-30" />
            <p className="text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </section>
    </div>
  );
}

function NewChat({ meId, onCreated }: { meId: string; onCreated: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'direct' | 'group'>('direct');
  const [term, setTerm] = useState('');
  const [groupName, setGroupName] = useState('');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const usersQuery = useUserSearch(term);
  const createConversation = useCreateConversation();

  function reset() {
    setMode('direct');
    setTerm('');
    setGroupName('');
    setPicked({});
  }

  function startDirect(userId: string) {
    createConversation.mutate(
      { type: 'private', members: [userId] },
      {
        onSuccess: (conv) => {
          onCreated(conv.id);
          setOpen(false);
          reset();
        },
      },
    );
  }

  function createGroup() {
    const members = Object.entries(picked).filter(([, v]) => v).map(([k]) => k);
    if (members.length === 0) return;
    createConversation.mutate(
      { type: 'team', name: groupName.trim() || 'New Group', members },
      {
        onSuccess: (conv) => {
          onCreated(conv.id);
          setOpen(false);
          reset();
        },
      },
    );
  }

  const users = (usersQuery.data ?? []).filter((u) => u.id !== meId);
  const pickedCount = Object.values(picked).filter(Boolean).length;

  return (
    <Popover
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <PopoverTrigger
        className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        aria-label="New chat"
      >
        <Plus className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        {/* Mode toggle */}
        <div className="mb-2 flex gap-1 rounded-lg bg-muted p-0.5">
          {(['direct', 'group'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={cn(
                'flex-1 rounded-md py-1 text-xs font-medium capitalize transition-colors',
                mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
              )}
            >
              {m === 'direct' ? 'Direct' : 'Group'}
            </button>
          ))}
        </div>

        {mode === 'group' && (
          <input
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Group name"
            className="mb-2 h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        )}

        <SearchInput value={term} onChange={setTerm} placeholder="Search people…" className="mb-2 w-full" />

        <div className="max-h-56 overflow-y-auto">
          {users.length ? (
            users.map((u) => {
              const name = `${u.firstName} ${u.lastName}`;
              const isPicked = picked[u.id] ?? false;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() =>
                    mode === 'direct'
                      ? startDirect(u.id)
                      : setPicked((p) => ({ ...p, [u.id]: !p[u.id] }))
                  }
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent',
                    mode === 'group' && isPicked && 'bg-primary/5',
                  )}
                >
                  <UserAvatar name={name} src={u.avatar} className="size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  {mode === 'group' && (
                    <span
                      className={cn(
                        'flex size-4 shrink-0 items-center justify-center rounded border',
                        isPicked ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                      )}
                    >
                      {isPicked && <Check className="size-3" />}
                    </span>
                  )}
                </button>
              );
            })
          ) : (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">No users found.</p>
          )}
        </div>

        {mode === 'group' && (
          <button
            type="button"
            onClick={createGroup}
            disabled={pickedCount === 0 || createConversation.isPending}
            className="mt-2 inline-flex h-9 w-full items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
          >
            Create group{pickedCount > 0 ? ` (${pickedCount})` : ''}
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

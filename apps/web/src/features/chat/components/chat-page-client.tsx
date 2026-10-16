'use client';

import type { ConversationDto, PresenceEvent } from '@rocket/shared';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Search } from 'lucide-react';
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
  const [term, setTerm] = useState('');
  const usersQuery = useUserSearch(term);
  const createConversation = useCreateConversation();

  function start(userId: string) {
    createConversation.mutate(
      { type: 'private', members: [userId] },
      {
        onSuccess: (conv) => {
          onCreated(conv.id);
          setOpen(false);
          setTerm('');
        },
      },
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90"
        aria-label="New chat"
      >
        <Plus className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-2">
        <SearchInput
          value={term}
          onChange={setTerm}
          placeholder="Search people…"
          className="mb-2 w-full"
        />
        <div className="max-h-64 overflow-y-auto">
          {usersQuery.data?.length ? (
            usersQuery.data
              .filter((u) => u.id !== meId)
              .map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => start(u.id)}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent"
                >
                  <UserAvatar name={`${u.firstName} ${u.lastName}`} src={u.avatar} className="size-8" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {u.firstName} {u.lastName}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </button>
              ))
          ) : (
            <p className="px-2 py-4 text-center text-sm text-muted-foreground">
              No users found.
            </p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

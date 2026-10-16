'use client';

import type { MessageDto, MessageNewEvent, PresenceEvent, TypingEvent } from '@rocket/shared';
import { format } from 'date-fns';
import { MessageSquare, Paperclip, Send, Smile } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { getMessages } from '@/features/chat/api';
import { convTitle, convAvatarName, senderId } from '@/features/chat/chat-utils';
import { useConversations, useInvalidateConversations } from '@/features/chat/hooks';
import { emitSocket, useSocketConnection, useSocketEvent } from '@/features/chat/use-socket';
import { useMe } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

export function ChatPanel() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Messages"
      >
        <MessageSquare className="size-5" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-success ring-2 ring-card" />
      </SheetTrigger>

      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        {open && <ChatPanelBody />}
      </SheetContent>
    </Sheet>
  );
}

function ChatPanelBody() {
  useSocketConnection();
  const { data: me } = useMe();
  const meId = me?.id ?? '';
  const conversationsQuery = useConversations();
  const invalidateConvs = useInvalidateConversations();

  const conversations = conversationsQuery.data ?? [];
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [online, setOnline] = useState<Set<string>>(new Set());
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Default to the first conversation.
  useEffect(() => {
    if (!selectedId && conversations.length) setSelectedId(conversations[0]!.id);
  }, [conversations, selectedId]);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setMessages([]);
    setTyping(new Set());
    getMessages(selectedId).then((m) => {
      setMessages(m);
      scrollToBottom();
    });
    emitSocket('conversation:join', selectedId);
    emitSocket('message:read', selectedId);
    return () => emitSocket('conversation:leave', selectedId);
  }, [selectedId, scrollToBottom]);

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
  useSocketEvent<MessageNewEvent>(
    'message:new',
    useCallback(
      (e) => {
        invalidateConvs();
        if (e.conversation !== selectedId) return;
        setMessages((prev) => (prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message]));
        emitSocket('message:read', selectedId);
        scrollToBottom();
      },
      [selectedId, invalidateConvs, scrollToBottom],
    ),
  );
  useSocketEvent<TypingEvent>(
    'typing:start',
    useCallback((e) => {
      if (e.conversation === selectedId && e.user !== meId) setTyping((p) => new Set(p).add(e.user));
    }, [selectedId, meId]),
  );
  useSocketEvent<TypingEvent>(
    'typing:stop',
    useCallback((e) => {
      if (e.conversation === selectedId)
        setTyping((p) => {
          const n = new Set(p);
          n.delete(e.user);
          return n;
        });
    }, [selectedId]),
  );

  function onDraft(v: string) {
    setDraft(v);
    if (!selectedId) return;
    emitSocket('typing:start', selectedId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitSocket('typing:stop', selectedId), 1500);
  }

  function send() {
    const text = draft.trim();
    if (!text || !selectedId) return;
    emitSocket('message:send', { conversation: selectedId, text });
    setDraft('');
    emitSocket('typing:stop', selectedId);
  }

  return (
    <>
      <div className="border-b border-border px-5 py-4">
        <SheetTitle>Messages</SheetTitle>
        <p className="text-xs text-muted-foreground">{online.size} online</p>

        {/* Conversation avatars */}
        <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No conversations.{' '}
              <Link href="/chat" className="text-primary hover:underline">
                Start one
              </Link>
            </p>
          )}
          {conversations.map((c) => {
            const partnerOnline =
              c.type === 'private' && c.members.some((m) => m.id !== meId && online.has(m.id));
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className="flex shrink-0 flex-col items-center gap-1.5 outline-none"
              >
                <span className="relative">
                  <UserAvatar
                    name={convAvatarName(c, meId)}
                    className={cn('size-11', c.id === selectedId && 'ring-2 ring-primary ring-offset-2 ring-offset-card')}
                  />
                  {partnerOnline && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-card" />
                  )}
                </span>
                <span className="w-12 truncate text-center text-[11px] text-muted-foreground">
                  {convTitle(c, meId).split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-5 py-4">
        {!selectedId ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Select a conversation
          </div>
        ) : (
          messages.map((msg) => {
            const mine = senderId(msg) === meId;
            return (
              <div key={msg.id} className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                    mine ? 'rounded-br-sm bg-primary text-primary-foreground' : 'rounded-bl-sm bg-muted text-foreground',
                  )}
                >
                  {msg.text}
                  {msg.createdAt && (
                    <span className={cn('ml-2 inline-block text-[10px]', mine ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {format(new Date(msg.createdAt), 'HH:mm')}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
        {typing.size > 0 && (
          <div className="flex items-center gap-1 pl-1 text-xs text-muted-foreground">
            <span className="flex gap-0.5">
              <Dot /> <Dot className="[animation-delay:-0.15s]" /> <Dot className="[animation-delay:-0.3s]" />
            </span>
            typing…
          </div>
        )}
      </div>

      {/* Composer */}
      {selectedId && (
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5">
            <button type="button" className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground" aria-label="Attach">
              <Paperclip className="size-4" />
            </button>
            <input
              value={draft}
              onChange={(e) => onDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type a message…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button type="button" className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground hover:text-foreground" aria-label="Emoji">
              <Smile className="size-4" />
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function Dot({ className }: { className?: string }) {
  return <span className={cn('size-1.5 animate-bounce rounded-full bg-muted-foreground/70', className)} />;
}

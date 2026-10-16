'use client';

import type {
  ConversationDto,
  MessageDto,
  MessageNewEvent,
  TypingEvent,
} from '@rocket/shared';
import { format, isSameDay } from 'date-fns';
import { Info, Paperclip, Send, Smile } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { getMessages } from '@/features/chat/api';
import { ContactPanel } from '@/features/chat/components/contact-panel';
import {
  convAvatarName,
  convTitle,
  senderId,
} from '@/features/chat/chat-utils';
import { useInvalidateConversations } from '@/features/chat/hooks';
import { emitSocket, useSocketEvent } from '@/features/chat/use-socket';
import { cn } from '@/lib/utils';

const PAGE = 30;

export function ChatThread({
  conversation,
  meId,
  online,
}: {
  conversation: ConversationDto;
  meId: string;
  online: Set<string>;
}) {
  const convId = conversation.id;
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [draft, setDraft] = useState('');
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [showPanel, setShowPanel] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidateConvs = useInvalidateConversations();

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  // Load the latest page when the conversation changes.
  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setHasMore(true);
    setTypingUsers(new Set());
    getMessages(convId)
      .then((m) => {
        setMessages(m);
        setHasMore(m.length >= PAGE);
      })
      .finally(() => {
        setLoading(false);
        scrollToBottom();
      });
    emitSocket('conversation:join', convId);
    emitSocket('message:read', convId);
    return () => emitSocket('conversation:leave', convId);
  }, [convId, scrollToBottom]);

  useSocketEvent<MessageNewEvent>(
    'message:new',
    useCallback(
      (e) => {
        invalidateConvs();
        if (e.conversation !== convId) return;
        setMessages((prev) =>
          prev.some((m) => m.id === e.message.id) ? prev : [...prev, e.message],
        );
        emitSocket('message:read', convId);
        scrollToBottom();
      },
      [convId, invalidateConvs, scrollToBottom],
    ),
  );

  useSocketEvent<TypingEvent>(
    'typing:start',
    useCallback(
      (e) => {
        if (e.conversation === convId && e.user !== meId) {
          setTypingUsers((p) => new Set(p).add(e.user));
        }
      },
      [convId, meId],
    ),
  );
  useSocketEvent<TypingEvent>(
    'typing:stop',
    useCallback(
      (e) => {
        if (e.conversation === convId) {
          setTypingUsers((p) => {
            const n = new Set(p);
            n.delete(e.user);
            return n;
          });
        }
      },
      [convId],
    ),
  );

  function onDraft(v: string) {
    setDraft(v);
    emitSocket('typing:start', convId);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => emitSocket('typing:stop', convId), 1500);
  }

  function send() {
    const text = draft.trim();
    if (!text) return;
    emitSocket('message:send', { conversation: convId, text });
    setDraft('');
    emitSocket('typing:stop', convId);
  }

  async function onScroll(e: React.UIEvent<HTMLDivElement>) {
    if (e.currentTarget.scrollTop > 40 || !hasMore || loadingOlder || !messages.length)
      return;
    setLoadingOlder(true);
    const el = scrollRef.current;
    const prevHeight = el?.scrollHeight ?? 0;
    const older = await getMessages(convId, messages[0]!.id);
    setMessages((prev) => [...older, ...prev]);
    setHasMore(older.length >= PAGE);
    setLoadingOlder(false);
    requestAnimationFrame(() => {
      if (el) el.scrollTop = el.scrollHeight - prevHeight;
    });
  }

  const partnerOnline =
    conversation.type === 'private' &&
    conversation.members.some((m) => m.id !== meId && online.has(m.id));

  return (
    <div className="flex min-h-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="relative">
          <UserAvatar name={convAvatarName(conversation, meId)} className="size-9" />
          {partnerOnline && (
            <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-success ring-2 ring-card" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold">{convTitle(conversation, meId)}</p>
          <p className="text-xs text-muted-foreground">
            {conversation.type === 'team'
              ? `${conversation.members.length} members`
              : partnerOnline
                ? 'Online'
                : 'Offline'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowPanel((s) => !s)}
          aria-label="Contact info"
          aria-pressed={showPanel}
          className={cn(
            'ml-auto inline-flex size-8 items-center justify-center rounded-md transition-colors',
            showPanel ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
          )}
        >
          <Info className="size-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} onScroll={onScroll} className="flex-1 space-y-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Loading…
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No messages yet. Say hello 👋
          </div>
        ) : (
          messages.map((msg, i) => {
            const mine = senderId(msg) === meId;
            const prev = messages[i - 1];
            const showDate =
              !prev ||
              (msg.createdAt &&
                prev.createdAt &&
                !isSameDay(new Date(msg.createdAt), new Date(prev.createdAt)));
            return (
              <div key={msg.id}>
                {showDate && msg.createdAt && (
                  <div className="my-3 flex items-center gap-3">
                    <span className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(msg.createdAt), 'd MMM yyyy')}
                    </span>
                    <span className="h-px flex-1 bg-border" />
                  </div>
                )}
                <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-3.5 py-2 text-sm',
                      mine
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-muted text-foreground',
                    )}
                  >
                    {msg.text}
                    {msg.createdAt && (
                      <span
                        className={cn(
                          'ml-2 inline-block text-[10px]',
                          mine ? 'text-primary-foreground/70' : 'text-muted-foreground',
                        )}
                      >
                        {format(new Date(msg.createdAt), 'HH:mm')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {typingUsers.size > 0 && (
          <div className="flex items-center gap-1 pl-1 pt-1 text-xs text-muted-foreground">
            <span className="flex gap-0.5">
              <Dot /> <Dot className="[animation-delay:-0.15s]" /> <Dot className="[animation-delay:-0.3s]" />
            </span>
            typing…
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1">
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
      </div>

      {showPanel && (
        <ContactPanel
          conversation={conversation}
          meId={meId}
          online={online}
          onClose={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}

function Dot({ className }: { className?: string }) {
  return (
    <span
      className={cn('size-1.5 animate-bounce rounded-full bg-muted-foreground/70', className)}
    />
  );
}

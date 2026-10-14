'use client';

import { MessageSquare, Paperclip, Send, Smile } from 'lucide-react';
import { useRef, useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  chatContacts,
  chatMessages,
  typingContactId,
  type ChatMessage,
} from '@/features/chat/mock';
import { cn } from '@/lib/utils';

export function ChatPanel() {
  const activeContact = chatContacts[0]!;
  const [messages, setMessages] = useState<ChatMessage[]>(chatMessages);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  function send() {
    const text = draft.trim();
    if (!text) return;
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes(),
    ).padStart(2, '0')}`;
    setMessages((prev) => [
      ...prev,
      { id: `local-${prev.length}`, from: 'me', text, time },
    ]);
    setDraft('');
    // Keep the newest message in view after it renders.
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
    });
  }

  const onlineCount = chatContacts.filter((c) => c.online).length;

  return (
    <Sheet>
      <SheetTrigger
        className="relative inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Messages"
      >
        <MessageSquare className="size-5" />
        <span className="absolute right-2 top-2 size-2 rounded-full bg-success ring-2 ring-card" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        {/* Header */}
        <div className="border-b border-border px-5 py-4">
          <SheetTitle>Messages</SheetTitle>
          <p className="text-xs text-muted-foreground">
            {onlineCount} contacts online
          </p>

          {/* Contacts avatar row */}
          <div className="mt-4 flex gap-4 overflow-x-auto pb-1">
            {chatContacts.map((contact, i) => (
              <button
                key={contact.id}
                type="button"
                className="flex shrink-0 flex-col items-center gap-1.5 outline-none"
              >
                <span className="relative">
                  <UserAvatar
                    name={contact.name}
                    src={contact.avatar}
                    className={cn(
                      'size-11',
                      i === 0 && 'ring-2 ring-primary ring-offset-2 ring-offset-card',
                    )}
                  />
                  {contact.online && (
                    <span className="absolute bottom-0 right-0 size-3 rounded-full bg-success ring-2 ring-card" />
                  )}
                </span>
                <span className="w-12 truncate text-center text-[11px] text-muted-foreground">
                  {contact.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">Today</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {messages.map((msg) => {
            const mine = msg.from === 'me';
            return (
              <div
                key={msg.id}
                className={cn('flex items-end gap-2', mine && 'flex-row-reverse')}
              >
                {!mine && (
                  <UserAvatar name={activeContact.name} className="size-7" />
                )}
                <div className={cn('max-w-[75%]', mine && 'text-right')}>
                  <div
                    className={cn(
                      'rounded-2xl px-3.5 py-2 text-sm',
                      mine
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-muted text-foreground',
                    )}
                  >
                    {msg.text}
                  </div>
                  <span className="mt-1 inline-block text-[11px] text-muted-foreground">
                    {msg.time}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {typingContactId === activeContact.id && (
            <div className="flex items-end gap-2">
              <UserAvatar name={activeContact.name} className="size-7" />
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                <Dot className="[animation-delay:-0.3s]" />
                <Dot className="[animation-delay:-0.15s]" />
                <Dot />
              </div>
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-2 py-1.5">
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Add attachment"
            >
              <Paperclip className="size-4" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type a message…"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Add emoji"
            >
              <Smile className="size-4" />
            </button>
            <button
              type="button"
              onClick={send}
              disabled={!draft.trim()}
              className="inline-flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity hover:bg-primary/90 disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Dot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'size-1.5 animate-bounce rounded-full bg-muted-foreground/70',
        className,
      )}
    />
  );
}

'use client';

import { MailFolder, type MailDto } from '@rocket/shared';
import { format } from 'date-fns';
import { Paperclip, Star } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

function preview(body: string): string {
  return body.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

interface MailListProps {
  mails: MailDto[];
  folder: MailFolder;
  selectedIds: Record<string, boolean>;
  onToggleSelect: (id: string, value: boolean) => void;
  onOpen: (id: string) => void;
  onToggleStar: (mail: MailDto) => void;
}

export function MailList({
  mails,
  folder,
  selectedIds,
  onToggleSelect,
  onOpen,
  onToggleStar,
}: MailListProps) {
  if (mails.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-muted-foreground">
        No messages here.
      </div>
    );
  }

  const outgoing = folder === MailFolder.Sent || folder === MailFolder.Draft;

  return (
    <div className="flex flex-col divide-y divide-border/60">
      {mails.map((mail) => {
        const who = outgoing ? mail.to[0] ?? '—' : mail.from.name;
        const unread = !mail.isRead;
        const selected = selectedIds[mail.id] ?? false;
        return (
          <div
            key={mail.id}
            onClick={() => onOpen(mail.id)}
            className={cn(
              'group flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors',
              selected ? 'bg-primary/5' : 'hover:bg-accent/40',
            )}
          >
            <Checkbox
              checked={selected}
              onCheckedChange={(v) => onToggleSelect(mail.id, v === true)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select mail"
              className="shrink-0"
            />

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleStar(mail);
              }}
              aria-label={mail.isStarred ? 'Unstar' : 'Star'}
              className={cn(
                'shrink-0 transition-colors',
                mail.isStarred
                  ? 'text-warning'
                  : 'text-muted-foreground/40 hover:text-muted-foreground',
              )}
            >
              <Star className={cn('size-4', mail.isStarred && 'fill-current')} />
            </button>

            <UserAvatar
              name={outgoing ? mail.to[0] ?? 'To' : mail.from.name}
              className="size-8 shrink-0"
            />

            {/* Sender */}
            <span
              className={cn(
                'w-32 shrink-0 truncate md:w-40',
                unread ? 'font-semibold text-foreground' : 'font-medium text-foreground/90',
              )}
            >
              {who}
            </span>

            {/* Subject — preview */}
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              <span className={cn(unread ? 'font-medium text-foreground' : 'text-foreground/80')}>
                {mail.subject || '(no subject)'}
              </span>
              {preview(mail.body) && (
                <span className="text-muted-foreground"> — {preview(mail.body)}</span>
              )}
            </span>

            {/* Labels */}
            {mail.labels.length > 0 && (
              <span className="hidden shrink-0 gap-1 lg:flex">
                {mail.labels.slice(0, 2).map((l) => (
                  <span
                    key={l}
                    className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                  >
                    {l}
                  </span>
                ))}
              </span>
            )}

            {mail.attachments.length > 0 && (
              <Paperclip className="size-3.5 shrink-0 text-muted-foreground" />
            )}

            <span className="w-12 shrink-0 text-right text-xs text-muted-foreground">
              {mail.createdAt ? format(new Date(mail.createdAt), 'HH:mm') : ''}
            </span>
          </div>
        );
      })}
    </div>
  );
}

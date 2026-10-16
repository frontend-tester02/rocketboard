'use client';

import { MailFolder, type MailDto } from '@rocket/shared';
import { formatDistanceToNow } from 'date-fns';
import { Star } from 'lucide-react';
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
        const who = outgoing
          ? `To: ${mail.to.join(', ') || '—'}`
          : mail.from.name;
        const unread = !mail.isRead;
        return (
          <div
            key={mail.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 px-4 py-3 transition-colors hover:bg-accent/50',
              unread && 'bg-primary/[0.03]',
            )}
            onClick={() => onOpen(mail.id)}
          >
            <Checkbox
              checked={selectedIds[mail.id] ?? false}
              onCheckedChange={(v) => onToggleSelect(mail.id, v === true)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Select mail"
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
                mail.isStarred ? 'text-warning' : 'text-muted-foreground/50 hover:text-muted-foreground',
              )}
            >
              <Star className={cn('size-4', mail.isStarred && 'fill-current')} />
            </button>
            <UserAvatar name={outgoing ? mail.to[0] ?? 'To' : mail.from.name} className="size-9" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className={cn('truncate text-sm', unread ? 'font-semibold' : 'font-medium')}>
                  {who}
                </p>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {mail.createdAt
                    ? formatDistanceToNow(new Date(mail.createdAt), { addSuffix: true })
                    : ''}
                </span>
              </div>
              <p className={cn('truncate text-sm', unread ? 'font-medium' : 'text-muted-foreground')}>
                {mail.subject || '(no subject)'}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {preview(mail.body)}
              </p>
              {mail.labels.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {mail.labels.map((l) => (
                    <span
                      key={l}
                      className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground"
                    >
                      {l}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

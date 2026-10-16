'use client';

import type { MailDto } from '@rocket/shared';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ArrowLeft, Loader2, Paperclip, Star, Trash2 } from 'lucide-react';
import { useEffect } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { useDeleteMail, useMail, usePatchMail } from '@/features/mail/hooks';
import { cn } from '@/lib/utils';

interface MailReaderProps {
  id: string;
  onBack: () => void;
  onDeleted: () => void;
}

export function MailReader({ id, onBack, onDeleted }: MailReaderProps) {
  const { data: mail, isLoading, isError } = useMail(id);
  const patchMail = usePatchMail();
  const deleteMail = useDeleteMail();
  const qc = useQueryClient();

  // Opening a mail marks it read server-side; refresh list + counts.
  useEffect(() => {
    if (mail) {
      void qc.invalidateQueries({ queryKey: ['mail', 'list'] });
      void qc.invalidateQueries({ queryKey: ['mail', 'counts'] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mail?.id]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }
  if (isError || !mail) {
    return (
      <div className="flex flex-1 items-center justify-center p-12 text-sm text-danger">
        Message not found.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
        <div className="ml-auto flex items-center gap-1">
          <ReaderMail mail={mail} patch={patchMail} />
          <button
            type="button"
            onClick={() => deleteMail.mutate(mail.id, { onSuccess: onDeleted })}
            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger/10 hover:text-danger"
            aria-label="Delete"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="text-lg font-semibold">{mail.subject || '(no subject)'}</h2>
        <div className="mt-4 flex items-center gap-3">
          <UserAvatar name={mail.from.name} className="size-10" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{mail.from.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {mail.from.email} · to {mail.to.join(', ') || '—'}
            </p>
          </div>
          {mail.createdAt && (
            <span className="text-xs text-muted-foreground">
              {format(new Date(mail.createdAt), 'd MMM yyyy, h:mm a')}
            </span>
          )}
        </div>

        <div
          className="prose prose-sm mt-5 max-w-none text-sm leading-relaxed text-foreground [&_p]:my-2"
          // Internal mailbox content authored within the app.
          dangerouslySetInnerHTML={{ __html: mail.body }}
        />

        {mail.attachments.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {mail.attachments.map((a) => (
              <a
                key={a.url}
                href={a.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent"
              >
                <Paperclip className="size-4 text-muted-foreground" />
                {a.name}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ReaderMail({
  mail,
  patch,
}: {
  mail: MailDto;
  patch: ReturnType<typeof usePatchMail>;
}) {
  return (
    <button
      type="button"
      onClick={() => patch.mutate({ id: mail.id, input: { isStarred: !mail.isStarred } })}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md transition-colors hover:bg-accent',
        mail.isStarred ? 'text-warning' : 'text-muted-foreground',
      )}
      aria-label={mail.isStarred ? 'Unstar' : 'Star'}
    >
      <Star className={cn('size-4', mail.isStarred && 'fill-current')} />
    </button>
  );
}

'use client';

import { Loader2, Minus, Paperclip, Send, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/features/products/components/tag-input';
import { useSaveDraft, useSendMail } from '@/features/mail/hooks';
import { uploadImage } from '@/features/uploads/api';
import { cn } from '@/lib/utils';

interface Attachment {
  name: string;
  url: string;
  size?: number;
}

export function ComposeMail({ onClose }: { onClose: () => void }) {
  const [minimized, setMinimized] = useState(false);
  const [to, setTo] = useState<string[]>([]);
  const [cc, setCc] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const sendMail = useSendMail();
  const saveDraft = useSaveDraft();

  function payload() {
    return {
      to,
      cc,
      subject: subject.trim(),
      body: body.trim() ? `<p>${body.trim().replace(/\n/g, '</p><p>')}</p>` : '',
      attachments,
    };
  }

  function send() {
    if (to.length === 0) return toast.error('Add at least one recipient');
    sendMail.mutate(payload(), { onSuccess: onClose });
  }

  function draft() {
    saveDraft.mutate(payload(), { onSuccess: onClose });
  }

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setAttachments((prev) => [...prev, { name: file.name, url: res.url, size: file.size }]);
    } catch {
      toast.error('Attachment upload failed (images only)');
    } finally {
      setUploading(false);
    }
  }

  const pending = sendMail.isPending || saveDraft.isPending;

  return (
    <div
      className={cn(
        'fixed bottom-0 right-6 z-50 w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-t-xl border border-border bg-card shadow-2xl',
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between bg-foreground px-4 py-2.5 text-background">
        <span className="text-sm font-medium">New Message</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMinimized((m) => !m)}
            className="inline-flex size-6 items-center justify-center rounded hover:bg-white/15"
            aria-label="Minimize"
          >
            <Minus className="size-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-6 items-center justify-center rounded hover:bg-white/15"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>

      {!minimized && (
        <div className="flex max-h-[70vh] flex-col">
          <div className="flex flex-col gap-2 px-4 py-3">
            {/* To */}
            <div className="flex items-center gap-2">
              <span className="w-10 shrink-0 text-xs text-muted-foreground">To</span>
              <div className="min-w-0 flex-1">
                <TagInput value={to} onChange={setTo} placeholder="Recipient email…" />
              </div>
              {!showCc && (
                <button
                  type="button"
                  onClick={() => setShowCc(true)}
                  className="shrink-0 text-xs font-medium text-primary hover:text-primary/80"
                >
                  Cc
                </button>
              )}
            </div>

            {showCc && (
              <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-xs text-muted-foreground">Cc</span>
                <div className="min-w-0 flex-1">
                  <TagInput value={cc} onChange={setCc} placeholder="Cc email…" />
                </div>
              </div>
            )}

            {/* Subject */}
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject"
              className="border-0 border-b border-border/60 px-1 focus-visible:ring-0"
            />
          </div>

          {/* Body */}
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your message…"
            className="min-h-40 flex-1 resize-none rounded-none border-0 focus-visible:ring-0"
          />

          {/* Attachments */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 px-4 py-2">
              {attachments.map((a, i) => (
                <span
                  key={a.url}
                  className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs"
                >
                  <Paperclip className="size-3" />
                  <span className="max-w-32 truncate">{a.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, j) => j !== i))}
                    aria-label="Remove attachment"
                    className="text-muted-foreground hover:text-danger"
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-2 border-t border-border px-4 py-3">
            <Button onClick={send} disabled={pending} className="gap-1.5">
              {sendMail.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Send
            </Button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Attach file"
            >
              {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickFile} />
            <button
              type="button"
              onClick={draft}
              disabled={pending}
              className="ml-auto text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              Save draft
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

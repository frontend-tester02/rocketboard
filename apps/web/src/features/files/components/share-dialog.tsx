'use client';

import type { FileDto } from '@rocket/shared';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export function ShareDialog({
  file,
  open,
  onOpenChange,
}: {
  file: FileDto | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    if (!file) return;
    try {
      await navigator.clipboard.writeText(file.url);
      setCopied(true);
      toast.success('Link copied');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Could not copy link');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share “{file?.name}”</DialogTitle>
          <DialogDescription>Anyone with this link can view the file.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2 p-1.5">
          <Input readOnly value={file?.url ?? ''} className="flex-1" onFocus={(e) => e.currentTarget.select()} />
          <Button onClick={copy} className="shrink-0 gap-1.5">
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

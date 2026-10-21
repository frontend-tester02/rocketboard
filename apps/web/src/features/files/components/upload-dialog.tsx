'use client';

import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, CheckCircle2, Loader2, UploadCloud, X } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { uploadFiles } from '@/features/files/api';
import { fileIcon, fileTint, formatBytes } from '@/features/files/file-meta';
import { fileKeys } from '@/features/files/hooks';
import { cn } from '@/lib/utils';

type Status = 'uploading' | 'done' | 'error' | 'cancelled';

interface UploadItem {
  id: string;
  file: File;
  progress: number;
  status: Status;
  controller: AbortController;
}

export function UploadDialog({
  open,
  onOpenChange,
  folderId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  folderId?: string;
}) {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [dragOver, setDragOver] = useState(false);

  const patch = useCallback((id: string, changes: Partial<UploadItem>) => {
    setItems((prev) => prev.map((it) => (it.id === id ? { ...it, ...changes } : it)));
  }, []);

  const startUpload = useCallback(
    async (item: UploadItem) => {
      try {
        await uploadFiles([item.file], folderId, (p) => patch(item.id, { progress: p }), item.controller.signal);
        patch(item.id, { status: 'done', progress: 100 });
        void qc.invalidateQueries({ queryKey: fileKeys.all });
      } catch (err) {
        if (item.controller.signal.aborted) {
          patch(item.id, { status: 'cancelled' });
        } else {
          patch(item.id, { status: 'error' });
          toast.error(`${item.file.name}: upload failed`);
        }
      }
    },
    [folderId, patch, qc],
  );

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const next = Array.from(files).map<UploadItem>((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        progress: 0,
        status: 'uploading',
        controller: new AbortController(),
      }));
      if (!next.length) return;
      setItems((prev) => [...prev, ...next]);
      next.forEach((item) => void startUpload(item));
    },
    [startUpload],
  );

  function removeItem(item: UploadItem) {
    if (item.status === 'uploading') item.controller.abort();
    setItems((prev) => prev.filter((it) => it.id !== item.id));
  }

  function retry(item: UploadItem) {
    const fresh: UploadItem = { ...item, progress: 0, status: 'uploading', controller: new AbortController() };
    patch(item.id, fresh);
    void startUpload(fresh);
  }

  function handleClose(next: boolean) {
    if (!next) {
      items.forEach((it) => it.status === 'uploading' && it.controller.abort());
      setItems([]);
    }
    onOpenChange(next);
  }

  const uploadingCount = items.filter((it) => it.status === 'uploading').length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload files</DialogTitle>
          <DialogDescription>Drag & drop files here or browse to upload.</DialogDescription>
        </DialogHeader>

        {/* Dropzone */}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
            dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-accent/40',
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UploadCloud className="size-5" />
          </span>
          <span className="text-sm font-medium">Click to browse or drag files</span>
          <span className="text-xs text-muted-foreground">Upload any file type</span>
          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files?.length) addFiles(e.target.files);
              e.target.value = '';
            }}
          />
        </button>

        {/* File list */}
        {items.length > 0 && (
          <ul className="flex max-h-72 flex-col gap-2 overflow-y-auto">
            {items.map((item) => {
              const Icon = fileIcon(item.file.type);
              return (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-lg border border-border/60 bg-card p-2.5"
                >
                  <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', fileTint(item.file.type))}>
                    <Icon className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium" title={item.file.name}>
                        {item.file.name}
                      </p>
                      <StatusIcon status={item.status} />
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            item.status === 'error' || item.status === 'cancelled'
                              ? 'bg-danger'
                              : item.status === 'done'
                                ? 'bg-success'
                                : 'bg-primary',
                          )}
                          style={{ width: `${item.status === 'done' ? 100 : item.progress}%` }}
                        />
                      </div>
                      <span className="w-20 shrink-0 text-right text-xs text-muted-foreground">
                        {item.status === 'done'
                          ? formatBytes(item.file.size)
                          : item.status === 'error'
                            ? 'Failed'
                            : item.status === 'cancelled'
                              ? 'Cancelled'
                              : `${item.progress}%`}
                      </span>
                    </div>
                  </div>
                  {(item.status === 'error' || item.status === 'cancelled') && (
                    <button
                      type="button"
                      onClick={() => retry(item)}
                      className="shrink-0 text-xs font-medium text-primary hover:underline"
                    >
                      Retry
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeItem(item)}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    aria-label={item.status === 'uploading' ? 'Cancel upload' : 'Remove'}
                  >
                    <X className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            {uploadingCount > 0 ? 'Cancel' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function StatusIcon({ status }: { status: Status }) {
  if (status === 'done') return <CheckCircle2 className="size-4 shrink-0 text-success" />;
  if (status === 'error' || status === 'cancelled') return <AlertCircle className="size-4 shrink-0 text-danger" />;
  return <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />;
}

'use client';

import { format } from 'date-fns';
import { ArrowLeft, Download, ExternalLink, Share2, Star, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { Button } from '@/components/ui/button';
import { getDownloadUrl } from '@/features/files/api';
import { ShareDialog } from '@/features/files/components/share-dialog';
import { fileIcon, fileTint, formatBytes } from '@/features/files/file-meta';
import { useDeleteFile, useFile, useUpdateFile } from '@/features/files/hooks';
import { cn } from '@/lib/utils';

export function FileViewer({ fileId }: { fileId: string }) {
  const router = useRouter();
  const { data: file, isLoading, isError } = useFile(fileId);
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();

  const [shareOpen, setShareOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function download() {
    if (!file) return;
    try {
      const { url } = await getDownloadUrl(file.id);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      a.target = '_blank';
      a.rel = 'noopener';
      a.click();
    } catch {
      /* toast handled elsewhere */
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-24 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (isError || !file) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border bg-card px-4 py-24 text-center">
        <p className="text-sm text-muted-foreground">This file could not be found.</p>
        <Button variant="outline" onClick={() => router.push('/files')}>
          <ArrowLeft className="size-4" />
          Back to files
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Back">
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-semibold" title={file.name}>
            {file.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {formatBytes(file.size)}
            {file.createdAt && ` · ${format(new Date(file.createdAt), 'd MMM yyyy')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            aria-label={file.isStarred ? 'Unstar' : 'Star'}
            onClick={() => updateFile.mutate({ id: file.id, input: { isStarred: !file.isStarred } })}
            className={cn(file.isStarred && 'text-warning')}
          >
            <Star className="size-4" fill={file.isStarred ? 'currentColor' : 'none'} />
          </Button>
          <Button variant="outline" className="gap-1.5" onClick={() => setShareOpen(true)}>
            <Share2 className="size-4" />
            Share
          </Button>
          <Button
            variant="outline"
            className="gap-1.5"
            onClick={() => window.open(file.url, '_blank', 'noopener')}
          >
            <ExternalLink className="size-4" />
            Open original
          </Button>
          <Button className="gap-1.5" onClick={download}>
            <Download className="size-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="icon"
            aria-label="Delete"
            className="text-danger hover:text-danger"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Preview */}
      <FilePreview mimeType={file.mimeType} url={file.url} name={file.name} />

      <ShareDialog file={file} open={shareOpen} onOpenChange={setShareOpen} />
      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete file?"
        description={`“${file.name}” will be permanently removed.`}
        confirmLabel="Delete"
        destructive
        onConfirm={() =>
          deleteFile.mutate(file.id, {
            onSuccess: () => router.push('/files'),
            onSettled: () => setConfirmDelete(false),
          })
        }
      />
    </div>
  );
}

function FilePreview({ mimeType, url, name }: { mimeType: string; url: string; name: string }) {
  const frame = 'flex items-center justify-center rounded-xl border border-border/60 bg-card p-4';

  if (mimeType.startsWith('image/')) {
    return (
      <div className={cn(frame, 'min-h-[50vh]')}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="max-h-[70vh] w-auto rounded-lg object-contain" />
      </div>
    );
  }

  if (mimeType.startsWith('video/')) {
    return (
      <div className={cn(frame, 'min-h-[50vh] bg-black/90')}>
        <video src={url} controls className="max-h-[70vh] w-full rounded-lg">
          <track kind="captions" />
        </video>
      </div>
    );
  }

  if (mimeType.startsWith('audio/')) {
    return (
      <div className={cn(frame, 'min-h-[30vh]')}>
        <audio src={url} controls className="w-full max-w-xl">
          <track kind="captions" />
        </audio>
      </div>
    );
  }

  if (mimeType === 'application/pdf' || mimeType.startsWith('text/')) {
    return (
      <iframe
        src={url}
        title={name}
        className="h-[75vh] w-full rounded-xl border border-border/60 bg-card"
      />
    );
  }

  const Icon = fileIcon(mimeType);
  return (
    <div className={cn(frame, 'min-h-[40vh] flex-col gap-4 text-center')}>
      <span className={cn('flex size-20 items-center justify-center rounded-2xl', fileTint(mimeType))}>
        <Icon className="size-9" />
      </span>
      <p className="text-sm text-muted-foreground">No preview available for this file type.</p>
    </div>
  );
}

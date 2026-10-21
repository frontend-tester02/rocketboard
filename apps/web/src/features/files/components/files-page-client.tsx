'use client';

import type { FileDto, FolderDto } from '@rocket/shared';
import { FolderPlus, Star, Upload } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PageHeader } from '@/components/common/page-header';
import { Button } from '@/components/ui/button';
import { FileCard } from '@/features/files/components/file-card';
import { FilesBreadcrumb } from '@/features/files/components/files-breadcrumb';
import { FolderCard } from '@/features/files/components/folder-card';
import { MoveDialog } from '@/features/files/components/move-dialog';
import { NameDialog } from '@/features/files/components/name-dialog';
import { ShareDialog } from '@/features/files/components/share-dialog';
import { StorageWidget } from '@/features/files/components/storage-widget';
import { getDownloadUrl } from '@/features/files/api';
import {
  useCreateFolder,
  useDeleteFile,
  useDeleteFolder,
  useFolderContents,
  useStorage,
  useUpdateFile,
  useUpdateFolder,
  useUploadFiles,
} from '@/features/files/hooks';
import { cn } from '@/lib/utils';

export function FilesPageClient({ folderId }: { folderId?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const starred = searchParams.get('starred') === '1';

  const contents = useFolderContents(starred ? undefined : folderId, starred);
  const storage = useStorage();

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const deleteFolder = useDeleteFolder();
  const updateFile = useUpdateFile();
  const deleteFile = useDeleteFile();
  const upload = useUploadFiles();

  const fileInput = useRef<HTMLInputElement>(null);
  const [newFolderOpen, setNewFolderOpen] = useState(false);
  const [renameFolder, setRenameFolder] = useState<FolderDto | null>(null);
  const [renameFile, setRenameFile] = useState<FileDto | null>(null);
  const [delFolder, setDelFolder] = useState<FolderDto | null>(null);
  const [delFile, setDelFile] = useState<FileDto | null>(null);
  const [moveFolder, setMoveFolder] = useState<FolderDto | null>(null);
  const [moveFile, setMoveFile] = useState<FileDto | null>(null);
  const [shareFile, setShareFile] = useState<FileDto | null>(null);

  const data = contents.data;
  const folders = data?.folders ?? [];
  const files = data?.files ?? [];
  const isEmpty = !contents.isLoading && folders.length === 0 && files.length === 0;

  async function download(file: FileDto) {
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

  function onPickFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = e.target.files ? Array.from(e.target.files) : [];
    if (picked.length) upload.mutate({ files: picked, folderId });
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="File Manager"
        actions={
          <>
            <Button variant="outline" className="gap-1.5" onClick={() => setNewFolderOpen(true)}>
              <FolderPlus className="size-4" />
              New Folder
            </Button>
            <Button className="gap-1.5" onClick={() => fileInput.current?.click()} disabled={upload.isPending}>
              <Upload className="size-4" />
              {upload.isPending ? 'Uploading…' : 'Upload'}
            </Button>
            <input ref={fileInput} type="file" multiple hidden onChange={onPickFiles} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr]">
        {/* Left: storage + quick access */}
        <div className="flex flex-col gap-4">
          <StorageWidget storage={storage.data} />
          <div className="rounded-xl border border-border/60 bg-card p-2 shadow-sm">
            <button
              type="button"
              onClick={() => router.push('/files')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                !starred ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <FolderPlus className="size-4" />
              All Files
            </button>
            <button
              type="button"
              onClick={() => router.push('/files?starred=1')}
              className={cn(
                'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                starred ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              <Star className="size-4" />
              Starred
            </button>
          </div>
        </div>

        {/* Right: breadcrumb + grid */}
        <div className="flex flex-col gap-4">
          {starred ? (
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <Star className="size-4 text-warning" />
              Starred files
            </h2>
          ) : (
            <FilesBreadcrumb trail={data?.breadcrumbs ?? []} />
          )}

          {contents.isLoading ? (
            <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
              Loading…
            </div>
          ) : isEmpty ? (
            <div className="rounded-xl border border-dashed border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">
              {starred ? 'No starred files.' : 'This folder is empty.'}
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {folders.length > 0 && (
                <section>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Folders
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {folders.map((f) => (
                      <FolderCard
                        key={f.id}
                        folder={f}
                        onOpen={() => router.push(`/files/${f.id}`)}
                        onRename={() => setRenameFolder(f)}
                        onMove={() => setMoveFolder(f)}
                        onDelete={() => setDelFolder(f)}
                      />
                    ))}
                  </div>
                </section>
              )}

              {files.length > 0 && (
                <section>
                  <h3 className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Files
                  </h3>
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                    {files.map((file) => (
                      <FileCard
                        key={file.id}
                        file={file}
                        onOpen={() => window.open(file.url, '_blank', 'noopener')}
                        onDownload={() => download(file)}
                        onRename={() => setRenameFile(file)}
                        onMove={() => setMoveFile(file)}
                        onShare={() => setShareFile(file)}
                        onToggleStar={() => updateFile.mutate({ id: file.id, input: { isStarred: !file.isStarred } })}
                        onDelete={() => setDelFile(file)}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NameDialog
        open={newFolderOpen}
        onOpenChange={setNewFolderOpen}
        title="New folder"
        label="Folder name"
        confirmLabel="Create"
        onSubmit={(name) => createFolder.mutate({ name, parentId: folderId ?? null })}
      />
      <NameDialog
        open={renameFolder !== null}
        onOpenChange={(o) => !o && setRenameFolder(null)}
        title="Rename folder"
        label="Folder name"
        initialValue={renameFolder?.name ?? ''}
        onSubmit={(name) => renameFolder && updateFolder.mutate({ id: renameFolder.id, input: { name } })}
      />
      <NameDialog
        open={renameFile !== null}
        onOpenChange={(o) => !o && setRenameFile(null)}
        title="Rename file"
        label="File name"
        initialValue={renameFile?.name ?? ''}
        onSubmit={(name) => renameFile && updateFile.mutate({ id: renameFile.id, input: { name } })}
      />

      <MoveDialog
        open={moveFolder !== null}
        onOpenChange={(o) => !o && setMoveFolder(null)}
        itemName={moveFolder?.name ?? ''}
        excludeFolderId={moveFolder?.id}
        currentParent={moveFolder?.parent ?? null}
        onMove={(dest) => moveFolder && updateFolder.mutate({ id: moveFolder.id, input: { parentId: dest } })}
      />
      <MoveDialog
        open={moveFile !== null}
        onOpenChange={(o) => !o && setMoveFile(null)}
        itemName={moveFile?.name ?? ''}
        currentParent={moveFile?.folder ?? null}
        onMove={(dest) => moveFile && updateFile.mutate({ id: moveFile.id, input: { folderId: dest } })}
      />
      <ShareDialog file={shareFile} open={shareFile !== null} onOpenChange={(o) => !o && setShareFile(null)} />

      <ConfirmDialog
        open={delFolder !== null}
        onOpenChange={(o) => !o && setDelFolder(null)}
        title="Delete folder?"
        description={delFolder ? `“${delFolder.name}” and everything inside it will be permanently removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => delFolder && deleteFolder.mutate(delFolder.id, { onSettled: () => setDelFolder(null) })}
      />
      <ConfirmDialog
        open={delFile !== null}
        onOpenChange={(o) => !o && setDelFile(null)}
        title="Delete file?"
        description={delFile ? `“${delFile.name}” will be permanently removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => delFile && deleteFile.mutate(delFile.id, { onSettled: () => setDelFile(null) })}
      />
    </div>
  );
}

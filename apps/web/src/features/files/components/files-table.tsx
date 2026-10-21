'use client';

import type { FileDto, FolderDto } from '@rocket/shared';
import { format } from 'date-fns';
import {
  Download,
  ExternalLink,
  Folder,
  FolderInput,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Share2,
  Star,
  Trash2,
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ItemMenuActions, type MenuAction } from '@/features/files/components/item-menu';
import { fileIcon, fileTint, formatBytes } from '@/features/files/file-meta';
import { cn } from '@/lib/utils';

export interface FolderRowActions {
  onOpen: (folder: FolderDto) => void;
  onRename: (folder: FolderDto) => void;
  onMove: (folder: FolderDto) => void;
  onDelete: (folder: FolderDto) => void;
}

export interface FileRowActions {
  onOpen: (file: FileDto) => void;
  onDownload: (file: FileDto) => void;
  onRename: (file: FileDto) => void;
  onMove: (file: FileDto) => void;
  onShare: (file: FileDto) => void;
  onToggleStar: (file: FileDto) => void;
  onDelete: (file: FileDto) => void;
}

/** Shared `?view=list` table that lists folders first, then files. */
export function FilesTable({
  folders,
  files,
  folderActions,
  fileActions,
}: {
  folders: FolderDto[];
  files: FileDto[];
  folderActions: FolderRowActions;
  fileActions: FileRowActions;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border/60 bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Owner</TableHead>
            <TableHead className="hidden md:table-cell">Size</TableHead>
            <TableHead className="hidden lg:table-cell">Modified</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => (
            <FolderRow key={`folder-${folder.id}`} folder={folder} actions={folderActions} />
          ))}
          {files.map((file) => (
            <FileRow key={`file-${file.id}`} file={file} actions={fileActions} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FolderRow({ folder, actions }: { folder: FolderDto; actions: FolderRowActions }) {
  const color = folder.color || '#3E4DF5';
  const menu: MenuAction[] = [
    { key: 'open', label: 'Open', icon: FolderOpen, onSelect: () => actions.onOpen(folder) },
    { key: 'rename', label: 'Rename', icon: Pencil, onSelect: () => actions.onRename(folder) },
    { key: 'move', label: 'Move', icon: FolderInput, onSelect: () => actions.onMove(folder) },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onSelect: () => actions.onDelete(folder),
      danger: true,
      separatorBefore: true,
    },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className="cursor-pointer" onDoubleClick={() => actions.onOpen(folder)}>
          <TableCell>
            <button
              type="button"
              onClick={() => actions.onOpen(folder)}
              className="flex items-center gap-3 text-left"
            >
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${color}1a`, color }}
              >
                <Folder className="size-4" fill="currentColor" fillOpacity={0.15} />
              </span>
              <span className="font-medium">{folder.name}</span>
            </button>
          </TableCell>
          <TableCell className="hidden text-muted-foreground sm:table-cell">Me</TableCell>
          <TableCell className="hidden text-muted-foreground md:table-cell">
            {folder.fileCount} items
          </TableCell>
          <TableCell className="hidden text-muted-foreground lg:table-cell">
            {folder.updatedAt ? format(new Date(folder.updatedAt), 'd MMM yyyy') : '—'}
          </TableCell>
          <RowMenuCell menu={menu} label="Folder actions" />
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ItemMenuActions actions={menu} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function FileRow({ file, actions }: { file: FileDto; actions: FileRowActions }) {
  const Icon = fileIcon(file.mimeType);
  const menu: MenuAction[] = [
    { key: 'open', label: 'Open', icon: ExternalLink, onSelect: () => actions.onOpen(file) },
    { key: 'download', label: 'Download', icon: Download, onSelect: () => actions.onDownload(file) },
    { key: 'rename', label: 'Rename', icon: Pencil, onSelect: () => actions.onRename(file) },
    { key: 'move', label: 'Move', icon: FolderInput, onSelect: () => actions.onMove(file) },
    { key: 'share', label: 'Share', icon: Share2, onSelect: () => actions.onShare(file) },
    {
      key: 'star',
      label: file.isStarred ? 'Unstar' : 'Star',
      icon: Star,
      onSelect: () => actions.onToggleStar(file),
    },
    {
      key: 'delete',
      label: 'Delete',
      icon: Trash2,
      onSelect: () => actions.onDelete(file),
      danger: true,
      separatorBefore: true,
    },
  ];

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <TableRow className="cursor-pointer" onDoubleClick={() => actions.onOpen(file)}>
          <TableCell>
            <button
              type="button"
              onClick={() => actions.onOpen(file)}
              className="flex items-center gap-3 text-left"
            >
              <span className={cn('flex size-9 shrink-0 items-center justify-center rounded-lg', fileTint(file.mimeType))}>
                <Icon className="size-4" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 font-medium">
                  <span className="truncate">{file.name}</span>
                  {file.isStarred && <Star className="size-3.5 shrink-0 text-warning" fill="currentColor" />}
                </span>
              </span>
            </button>
          </TableCell>
          <TableCell className="hidden text-muted-foreground sm:table-cell">Me</TableCell>
          <TableCell className="hidden text-muted-foreground md:table-cell">
            {formatBytes(file.size)}
          </TableCell>
          <TableCell className="hidden text-muted-foreground lg:table-cell">
            {file.createdAt ? format(new Date(file.createdAt), 'd MMM yyyy') : '—'}
          </TableCell>
          <RowMenuCell menu={menu} label="File actions" />
        </TableRow>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ItemMenuActions actions={menu} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

function RowMenuCell({ menu, label }: { menu: MenuAction[]; label: string }) {
  return (
    <TableCell className="text-right">
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={label}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <ItemMenuActions actions={menu} Item={DropdownMenuItem} Separator={DropdownMenuSeparator} />
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  );
}

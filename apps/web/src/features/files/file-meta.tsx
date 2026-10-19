import { storageKindOf, type StorageKind } from '@rocket/shared';
import {
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  File as FileIcon,
  type LucideIcon,
} from 'lucide-react';

export const kindMeta: Record<StorageKind, { label: string; icon: LucideIcon; tint: string; bar: string }> = {
  images: { label: 'Images', icon: FileImage, tint: 'bg-primary/10 text-primary', bar: 'bg-primary' },
  documents: { label: 'Documents', icon: FileText, tint: 'bg-warning/15 text-warning', bar: 'bg-warning' },
  videos: { label: 'Videos', icon: FileVideo, tint: 'bg-danger/10 text-danger', bar: 'bg-danger' },
  audio: { label: 'Audio', icon: FileAudio, tint: 'bg-success/10 text-success', bar: 'bg-success' },
  other: { label: 'Other', icon: FileArchive, tint: 'bg-muted text-muted-foreground', bar: 'bg-muted-foreground' },
};

export function fileIcon(mimeType: string): LucideIcon {
  return kindMeta[storageKindOf(mimeType)]?.icon ?? FileIcon;
}

export function fileTint(mimeType: string): string {
  return kindMeta[storageKindOf(mimeType)]?.tint ?? 'bg-muted text-muted-foreground';
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/** Human-readable size: 1.4 MB, 820 KB, … */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

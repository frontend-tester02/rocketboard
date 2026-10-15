'use client';

import { ChevronLeft, ChevronRight, Loader2, Star, Upload, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { uploadImage } from '@/features/uploads/api';
import { cn } from '@/lib/utils';

const MAX_SIZE = 5 * 1024 * 1024;

interface Uploading {
  id: string;
  progress: number;
}

interface ImagesTabProps {
  value: string[];
  onChange: (images: string[]) => void;
}

export function ImagesTab({ value, onChange }: ImagesTabProps) {
  const [uploading, setUploading] = useState<Uploading[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const valueRef = useRef(value);
  valueRef.current = value;

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    for (const file of list) {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name}: not an image`);
        continue;
      }
      if (file.size > MAX_SIZE) {
        toast.error(`${file.name}: larger than 5 MB`);
        continue;
      }
      const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setUploading((prev) => [...prev, { id, progress: 0 }]);
      try {
        const res = await uploadImage(file, (p) =>
          setUploading((prev) =>
            prev.map((u) => (u.id === id ? { ...u, progress: p } : u)),
          ),
        );
        onChange([...valueRef.current, res.url]);
      } catch {
        toast.error(`${file.name}: upload failed`);
      } finally {
        setUploading((prev) => prev.filter((u) => u.id !== id));
      }
    }
  }

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  function setPrimary(url: string) {
    onChange([url, ...value.filter((u) => u !== url)]);
  }

  function move(index: number, dir: -1 | 1) {
    const next = [...value];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target]!, next[index]!];
    onChange(next);
  }

  return (
    <div className="space-y-4">
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
          if (e.dataTransfer.files.length) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors',
          dragOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/50',
        )}
      >
        <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Upload className="size-5" />
        </span>
        <span className="text-sm font-medium">
          Drag & drop images here, or click to browse
        </span>
        <span className="text-xs text-muted-foreground">
          PNG, JPG, WEBP or GIF · up to 5 MB each
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = '';
        }}
      />

      {/* Preview grid */}
      {(value.length > 0 || uploading.length > 0) && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {value.map((url, i) => (
            <div
              key={url}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                i === 0 ? 'border-primary ring-1 ring-primary' : 'border-border/60',
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="size-full object-cover" />

              {i === 0 && (
                <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  <Star className="size-3" /> Primary
                </span>
              )}

              <button
                type="button"
                onClick={() => remove(url)}
                aria-label="Remove image"
                className="absolute right-1.5 top-1.5 inline-flex size-6 items-center justify-center rounded-md bg-black/50 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              >
                <X className="size-3.5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex gap-1">
                  <IconBtn label="Move left" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ChevronLeft className="size-3.5" />
                  </IconBtn>
                  <IconBtn
                    label="Move right"
                    disabled={i === value.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ChevronRight className="size-3.5" />
                  </IconBtn>
                </div>
                {i !== 0 && (
                  <button
                    type="button"
                    onClick={() => setPrimary(url)}
                    className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white hover:bg-white/20"
                  >
                    Set primary
                  </button>
                )}
              </div>
            </div>
          ))}

          {uploading.map((u) => (
            <div
              key={u.id}
              className="flex aspect-square flex-col items-center justify-center gap-2 rounded-lg border border-border/60 bg-muted"
            >
              <Loader2 className="size-5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{u.progress}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex size-6 items-center justify-center rounded text-white transition-colors hover:bg-white/20 disabled:opacity-30"
    >
      {children}
    </button>
  );
}

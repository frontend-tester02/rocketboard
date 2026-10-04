'use client';

import { Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Text input that debounces its value before calling `onChange` (default 300ms).
 * Controlled display value updates immediately; the callback is debounced.
 */
export function SearchInput({
  value = '',
  onChange,
  placeholder = 'Search…',
  debounceMs = 300,
  className,
}: {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  className?: string;
}) {
  const [internal, setInternal] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep in sync when the controlled value changes externally.
  useEffect(() => setInternal(value), [value]);

  function emit(next: string) {
    setInternal(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange?.(next), debounceMs);
  }

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    setInternal('');
    onChange?.('');
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  return (
    <div className={cn('relative w-full max-w-xs', className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={internal}
        onChange={(e) => emit(e.target.value)}
        placeholder={placeholder}
        className="pl-9 pr-9 [&::-webkit-search-cancel-button]:appearance-none"
        aria-label={placeholder}
      />
      {internal && (
        <button
          type="button"
          onClick={clear}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}

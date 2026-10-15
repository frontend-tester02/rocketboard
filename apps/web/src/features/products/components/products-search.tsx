'use client';

import type { ProductDto } from '@rocket/shared';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useProductSuggestions } from '@/features/products/hooks';
import { cn, formatCurrency } from '@/lib/utils';

interface ProductsSearchProps {
  /** Current committed search term (from the URL). */
  value: string;
  /** Commit a search term (updates the URL + table). */
  onChange: (value: string) => void;
  categoryName: (id?: string) => string;
  className?: string;
  debounceMs?: number;
}

export function ProductsSearch({
  value,
  onChange,
  categoryName,
  className,
  debounceMs = 300,
}: ProductsSearchProps) {
  const [input, setInput] = useState(value);
  const [debounced, setDebounced] = useState(value);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep in sync when the URL value changes externally.
  useEffect(() => setInput(value), [value]);

  // Debounce: drive both the suggestions query and the committed search term.
  function emit(next: string) {
    setInput(next);
    setOpen(true);
    setActiveIndex(-1);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setDebounced(next);
      onChange(next);
    }, debounceMs);
  }

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  // Close on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const query = useProductSuggestions(debounced);
  const results = debounced.trim() ? (query.data?.data ?? []) : [];
  const showDropdown = open && debounced.trim().length > 0;

  function commit(term: string) {
    if (timer.current) clearTimeout(timer.current);
    setInput(term);
    setDebounced(term);
    onChange(term);
    setOpen(false);
    setActiveIndex(-1);
  }

  function select(product: ProductDto) {
    commit(product.name);
  }

  function clear() {
    if (timer.current) clearTimeout(timer.current);
    setInput('');
    setDebounced('');
    onChange('');
    setOpen(false);
    setActiveIndex(-1);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown || results.length === 0) {
      if (e.key === 'Enter') commit(input);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && results[activeIndex]) select(results[activeIndex]);
      else commit(input);
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={input}
          onChange={(e) => emit(e.target.value)}
          onFocus={() => input.trim() && setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search products…"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls="product-search-listbox"
          aria-autocomplete="list"
          className="h-9 w-full rounded-lg border border-border/60 bg-background pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
        {input && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 inline-flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="product-search-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md"
        >
          {query.isLoading ? (
            <div className="flex items-center gap-2 px-3 py-6 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-muted-foreground">
              No matches for “{debounced}”.
            </div>
          ) : (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((product, i) => (
                <li key={product.id} role="option" aria-selected={i === activeIndex}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => select(product)}
                    className={cn(
                      'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors',
                      i === activeIndex ? 'bg-accent' : 'hover:bg-accent',
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted">
                      {product.images[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {product.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {categoryName(product.category)} · {product.sku}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-medium">
                      {formatCurrency(product.price)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

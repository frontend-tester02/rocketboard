'use client';

import { SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCategories } from '@/features/products/hooks';
import type {
  ProductsUrlState,
  ProductTab,
} from '@/features/products/use-products-url-state';

const ALL = '__all__';
const labelClass = 'text-xs font-medium text-muted-foreground';

type ParamUpdates = Record<string, string | number | undefined>;

interface ProductsFilterProps {
  state: ProductsUrlState;
  onApply: (updates: ParamUpdates) => void;
  /** Number of active filters, for the trigger badge. */
  activeCount: number;
}

export function ProductsFilter({ state, onApply, activeCount }: ProductsFilterProps) {
  const [open, setOpen] = useState(false);
  const categoriesQuery = useCategories();

  // Draft values, resynced from the URL each time the popover opens.
  const [category, setCategory] = useState<string>(state.category ?? ALL);
  const [status, setStatus] = useState<ProductTab>(state.tab);
  const [priceMin, setPriceMin] = useState<string>(state.priceMin?.toString() ?? '');
  const [priceMax, setPriceMax] = useState<string>(state.priceMax?.toString() ?? '');
  const [dateFrom, setDateFrom] = useState<string>(state.dateFrom ?? '');
  const [dateTo, setDateTo] = useState<string>(state.dateTo ?? '');

  useEffect(() => {
    if (!open) return;
    setCategory(state.category ?? ALL);
    setStatus(state.tab);
    setPriceMin(state.priceMin?.toString() ?? '');
    setPriceMax(state.priceMax?.toString() ?? '');
    setDateFrom(state.dateFrom ?? '');
    setDateTo(state.dateTo ?? '');
  }, [open, state]);

  function apply() {
    onApply({
      category: category === ALL ? undefined : category,
      tab: status === 'all' ? undefined : status,
      priceMin: priceMin.trim() === '' ? undefined : Number(priceMin),
      priceMax: priceMax.trim() === '' ? undefined : Number(priceMax),
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
    });
    setOpen(false);
  }

  function clear() {
    setCategory(ALL);
    setStatus('all');
    setPriceMin('');
    setPriceMax('');
    setDateFrom('');
    setDateTo('');
    onApply({
      category: undefined,
      tab: undefined,
      priceMin: undefined,
      priceMax: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="relative inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Filter"
      >
        <SlidersHorizontal className="size-4" />
        Filter
        {activeCount > 0 && (
          <span className="flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
            {activeCount}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 p-0">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Filters</p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="flex flex-col gap-3.5 px-4 py-3.5">
          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-9">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All categories</SelectItem>
                {categoriesQuery.data?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as ProductTab)}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Price range</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="h-9"
              />
              <span className="text-muted-foreground">–</span>
              <Input
                type="number"
                min={0}
                inputMode="decimal"
                placeholder="Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Date range */}
          <div className="flex flex-col gap-1.5">
            <Label className={labelClass}>Date added</Label>
            <div className="flex flex-col gap-2">
              <Input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
              <Input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border px-4 py-3">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="button" size="sm" onClick={apply}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

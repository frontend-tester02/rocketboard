'use client';

import type { ProductDto } from '@rocket/shared';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { LayoutGrid, List } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ExportMenu } from '@/components/common/export-menu';
import { PageHeader } from '@/components/common/page-header';
import { AddProductDrawer } from '@/features/products/components/add-product-drawer';
import { ProductsFilter } from '@/features/products/components/products-filter';
import { ProductsSearch } from '@/features/products/components/products-search';
import { ProductsGrid } from '@/features/products/components/products-grid';
import { ProductsTable } from '@/features/products/components/products-table';
import {
  useCategories,
  useDeleteProduct,
  useProductCounts,
  useProducts,
} from '@/features/products/hooks';
import {
  useProductsUrlState,
  type ProductTab,
} from '@/features/products/use-products-url-state';
import { cn } from '@/lib/utils';

const tabs: { value: ProductTab; label: string; countKey: 'all' | 'available' | 'disabled' }[] = [
  { value: 'all', label: 'All', countKey: 'all' },
  { value: 'available', label: 'Available', countKey: 'available' },
  { value: 'disabled', label: 'Disabled', countKey: 'disabled' },
];

export function ProductsPageClient() {
  const { state, setParams, query } = useProductsUrlState();
  const productsQuery = useProducts(query);
  const countsQuery = useProductCounts();
  const categoriesQuery = useCategories();
  const deleteProduct = useDeleteProduct();

  const [toDelete, setToDelete] = useState<ProductDto | null>(null);
  const [gridSelected, setGridSelected] = useState<Record<string, boolean>>({});

  const toggleGridSelect = useCallback((id: string, value: boolean) => {
    setGridSelected((prev) => ({ ...prev, [id]: value }));
  }, []);

  const categoryName = useCallback(
    (id?: string) => {
      if (!id) return '—';
      return categoriesQuery.data?.find((c) => c.id === id)?.name ?? '—';
    },
    [categoriesQuery.data],
  );

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: state.page - 1, pageSize: state.limit }),
    [state.page, state.limit],
  );

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setParams(
        { page: next.pageIndex + 1, limit: next.pageSize },
        false,
      );
    },
    [pagination, setParams],
  );

  const products = productsQuery.data?.data ?? [];
  const total = productsQuery.data?.meta.total ?? 0;

  // Filters that live in the popover (status lives in the tabs, counted separately).
  const activeFilterCount = [
    state.category,
    state.priceMin,
    state.priceMax,
    state.dateFrom,
    state.dateTo,
  ].filter((v) => v !== undefined).length;

  function confirmDelete() {
    if (!toDelete) return;
    deleteProduct.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Products"
        actions={
          <>
            <ExportMenu />
            <AddProductDrawer />
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((t) => {
          const count = countsQuery.data?.[t.countKey];
          const active = state.tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setParams({ tab: t.value === 'all' ? undefined : t.value })}
              className={cn(
                '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t.label}
              {count != null && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs',
                    active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <ProductsSearch
          value={state.search}
          onChange={(v) => setParams({ search: v || undefined })}
          categoryName={categoryName}
          className="w-full sm:max-w-xs"
        />
        <ProductsFilter
          state={state}
          onApply={(updates) => setParams(updates)}
          activeCount={activeFilterCount}
        />

        <div className="ml-auto flex items-center gap-1 rounded-lg border border-border/60 bg-background p-0.5">
          <ViewToggle
            active={state.view === 'list'}
            onClick={() => setParams({ view: undefined }, false)}
            label="List view"
          >
            <List className="size-4" />
          </ViewToggle>
          <ViewToggle
            active={state.view === 'grid'}
            onClick={() => setParams({ view: 'grid' }, false)}
            label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </ViewToggle>
        </div>
      </div>

      {/* Content */}
      {productsQuery.isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-8 text-center text-sm text-danger">
          Failed to load products.
        </div>
      ) : productsQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading products…
        </div>
      ) : state.view === 'grid' ? (
        <ProductsGrid
          data={products}
          categoryName={categoryName}
          onDelete={setToDelete}
          selected={gridSelected}
          onToggleSelect={toggleGridSelect}
        />
      ) : (
        <ProductsTable
          data={products}
          total={total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          categoryName={categoryName}
          onDelete={setToDelete}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete product?"
        description={
          toDelete
            ? `“${toDelete.name}” will be permanently removed. This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'inline-flex size-8 items-center justify-center rounded-md transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  );
}

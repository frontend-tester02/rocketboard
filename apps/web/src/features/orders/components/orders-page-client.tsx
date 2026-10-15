'use client';

import type { OrderDto, OrderStatus } from '@rocket/shared';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { ExportMenu } from '@/components/common/export-menu';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrdersTable } from '@/features/orders/components/orders-table';
import {
  useOrderCounts,
  useOrders,
  useUpdateOrderStatus,
} from '@/features/orders/hooks';
import { orderTabs } from '@/features/orders/order-meta';
import { useOrdersUrlState } from '@/features/orders/use-orders-url-state';
import { cn } from '@/lib/utils';

export function OrdersPageClient() {
  const { state, setParams, query } = useOrdersUrlState();
  const ordersQuery = useOrders(query);
  const countsQuery = useOrderCounts();
  const updateStatus = useUpdateOrderStatus();

  const pagination = useMemo<PaginationState>(
    () => ({ pageIndex: state.page - 1, pageSize: state.limit }),
    [state.page, state.limit],
  );

  const onPaginationChange = useCallback<OnChangeFn<PaginationState>>(
    (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      setParams({ page: next.pageIndex + 1, limit: next.pageSize }, false);
    },
    [pagination, setParams],
  );

  const onView = useCallback((order: OrderDto) => {
    // Order details modal arrives in stage 28.
    toast.info(`Order ${order.orderNo} details arrive in a later stage.`);
  }, []);

  const onStatusChange = useCallback(
    (order: OrderDto, status: OrderStatus) => {
      updateStatus.mutate({ id: order.id, input: { status } });
    },
    [updateStatus],
  );

  const orders = ordersQuery.data?.data ?? [];
  const total = ordersQuery.data?.meta.total ?? 0;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Orders" actions={<ExportMenu />} />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {orderTabs.map((t) => {
          const count =
            t.value === 'all'
              ? countsQuery.data?.all
              : countsQuery.data?.[t.value];
          const active = state.tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setParams({ tab: t.value === 'all' ? undefined : t.value })}
              className={cn(
                '-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
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
        <SearchInput
          value={state.search}
          onChange={(v) => setParams({ search: v || undefined })}
          placeholder="Search by order no or customer…"
          className="w-full sm:max-w-xs"
        />
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            Actions
            <ChevronDown className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem onSelect={() => ordersQuery.refetch()}>
              Refresh
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => toast.info('Bulk export arrives in stage I4.')}>
              Export selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      {ordersQuery.isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-8 text-center text-sm text-danger">
          Failed to load orders.
        </div>
      ) : ordersQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading orders…
        </div>
      ) : (
        <OrdersTable
          data={orders}
          total={total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          onView={onView}
          onStatusChange={onStatusChange}
        />
      )}
    </div>
  );
}

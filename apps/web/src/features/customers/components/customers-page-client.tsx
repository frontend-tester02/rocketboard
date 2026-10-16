'use client';

import type { CustomerDto } from '@rocket/shared';
import type { OnChangeFn, PaginationState } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { ExportMenu } from '@/components/common/export-menu';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import { CustomerStepperModal } from '@/features/customers/components/customer-stepper-modal';
import { CustomersTable } from '@/features/customers/components/customers-table';
import { useCustomers, useDeleteCustomer } from '@/features/customers/hooks';
import { useCustomersUrlState } from '@/features/customers/use-customers-url-state';

export function CustomersPageClient() {
  const { state, setParams, query } = useCustomersUrlState();
  const customersQuery = useCustomers(query);
  const deleteCustomer = useDeleteCustomer();
  const [toDelete, setToDelete] = useState<CustomerDto | null>(null);

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

  const onEdit = useCallback(() => {
    toast.info('Editing customers arrives with the Add Customer stepper.');
  }, []);

  const customers = customersQuery.data?.data ?? [];
  const total = customersQuery.data?.meta.total ?? 0;

  function confirmDelete() {
    if (!toDelete) return;
    deleteCustomer.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Customers"
        actions={
          <>
            <ExportMenu />
            <CustomerStepperModal />
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={state.search}
          onChange={(v) => setParams({ search: v || undefined })}
          placeholder="Search customers…"
          className="w-full sm:max-w-xs"
        />
      </div>

      {customersQuery.isError ? (
        <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-8 text-center text-sm text-danger">
          Failed to load customers.
        </div>
      ) : customersQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">
          Loading customers…
        </div>
      ) : (
        <CustomersTable
          data={customers}
          total={total}
          pagination={pagination}
          onPaginationChange={onPaginationChange}
          onDelete={setToDelete}
          onEdit={onEdit}
        />
      )}

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete customer?"
        description={
          toDelete
            ? `${toDelete.firstName} ${toDelete.lastName} will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        destructive
        onConfirm={confirmDelete}
      />
    </div>
  );
}

'use client';

import type { CustomerDto } from '@rocket/shared';
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { DataTable } from '@/components/common/data-table';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatCurrency, formatDate } from '@/lib/utils';

interface CustomersTableProps {
  data: CustomerDto[];
  total: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onDelete: (customer: CustomerDto) => void;
  onEdit: (customer: CustomerDto) => void;
}

export function CustomersTable({
  data,
  total,
  pagination,
  onPaginationChange,
  onDelete,
  onEdit,
}: CustomersTableProps) {
  const columns = useMemo<ColumnDef<CustomerDto>[]>(
    () => [
      {
        id: 'name',
        header: 'Customer',
        cell: ({ row }) => {
          const c = row.original;
          const name = `${c.firstName} ${c.lastName}`;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar name={name} src={c.avatar} className="size-9" />
              <span className="font-medium">{name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => row.original.phone ?? '—',
      },
      {
        accessorKey: 'ordersCount',
        header: 'Orders',
        cell: ({ row }) => row.original.ordersCount,
      },
      {
        accessorKey: 'totalSpent',
        header: 'Total Spent',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.totalSpent)}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Joined',
        cell: ({ row }) =>
          row.original.createdAt ? formatDate(row.original.createdAt) : '—',
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Row actions"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onEdit(row.original)}>
                  <Pencil className="size-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-danger focus:text-danger"
                  onSelect={() => onDelete(row.original)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onDelete, onEdit],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSelection
      total={total}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      emptyMessage="No customers found."
    />
  );
}

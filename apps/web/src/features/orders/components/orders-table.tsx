'use client';

import { OrderStatus, type OrderDto } from '@rocket/shared';
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from '@tanstack/react-table';
import { Eye, MoreHorizontal } from 'lucide-react';
import { useMemo } from 'react';
import { DataTable } from '@/components/common/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrderStatusBadge, paymentLabels } from '@/features/orders/order-meta';
import { formatCurrency, formatDate } from '@/lib/utils';

interface OrdersTableProps {
  data: OrderDto[];
  total: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  onView: (order: OrderDto) => void;
  onStatusChange: (order: OrderDto, status: OrderStatus) => void;
}

const statusActions: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.Processing, label: 'Mark as Processing' },
  { status: OrderStatus.Shipped, label: 'Mark as Shipped' },
  { status: OrderStatus.Refunded, label: 'Mark as Refunded' },
  { status: OrderStatus.Cancelled, label: 'Cancel order' },
];

export function OrdersTable({
  data,
  total,
  pagination,
  onPaginationChange,
  onView,
  onStatusChange,
}: OrdersTableProps) {
  const columns = useMemo<ColumnDef<OrderDto>[]>(
    () => [
      {
        accessorKey: 'orderNo',
        header: 'Order No',
        cell: ({ row }) => (
          <span className="font-medium">{row.original.orderNo}</span>
        ),
      },
      {
        accessorKey: 'customerName',
        header: 'Customer',
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) =>
          row.original.createdAt ? formatDate(row.original.createdAt) : '—',
      },
      {
        accessorKey: 'total',
        header: 'Total',
        cell: ({ row }) => (
          <span className="font-medium">{formatCurrency(row.original.total)}</span>
        ),
      },
      {
        accessorKey: 'paymentType',
        header: 'Payment',
        cell: ({ row }) => paymentLabels[row.original.paymentType],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
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
                <DropdownMenuItem onSelect={() => onView(row.original)}>
                  <Eye className="size-4" />
                  View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {statusActions.map((a) => (
                  <DropdownMenuItem
                    key={a.status}
                    disabled={row.original.status === a.status}
                    onSelect={() => onStatusChange(row.original, a.status)}
                    className={
                      a.status === OrderStatus.Cancelled
                        ? 'text-danger focus:text-danger'
                        : undefined
                    }
                  >
                    {a.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ),
      },
    ],
    [onView, onStatusChange],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSelection
      total={total}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      emptyMessage="No orders found."
    />
  );
}

'use client';

import type { ProductDto } from '@rocket/shared';
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
} from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Eye, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { DataTable } from '@/components/common/data-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductStatusBadge } from '@/features/products/components/product-status-badge';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProductsTableProps {
  data: ProductDto[];
  total: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  categoryName: (id?: string) => string;
  onDelete: (product: ProductDto) => void;
  onEdit: (product: ProductDto) => void;
}

export function ProductsTable({
  data,
  total,
  pagination,
  onPaginationChange,
  categoryName,
  onDelete,
  onEdit,
}: ProductsTableProps) {
  const columns = useMemo<ColumnDef<ProductDto>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Product Name',
        cell: ({ row }) => {
          const product = row.original;
          const img = product.images[0];
          return (
            <div className="flex items-center gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={img}
                    alt={product.name}
                    className="size-full object-cover"
                    loading="lazy"
                  />
                ) : null}
              </span>
              <span className="font-medium">{product.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'sku',
        header: 'Product No',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.sku}</span>
        ),
      },
      {
        id: 'category',
        header: 'Category',
        cell: ({ row }) => categoryName(row.original.category),
      },
      {
        accessorKey: 'createdAt',
        header: 'Date',
        cell: ({ row }) =>
          row.original.createdAt ? formatDate(row.original.createdAt) : '—',
      },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ row }) => (
          <span className="font-medium">
            {formatCurrency(row.original.price)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ProductStatusBadge status={row.original.status} />,
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
                <DropdownMenuItem>
                  <Eye className="size-4" />
                  View
                </DropdownMenuItem>
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
    [categoryName, onDelete, onEdit],
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      enableSelection
      total={total}
      pagination={pagination}
      onPaginationChange={onPaginationChange}
      emptyMessage="No products found."
    />
  );
}

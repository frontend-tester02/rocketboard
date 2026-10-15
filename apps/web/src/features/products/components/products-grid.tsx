'use client';

import type { ProductDto } from '@rocket/shared';
import { MoreHorizontal } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductStatusBadge } from '@/features/products/components/product-status-badge';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

interface ProductsGridProps {
  data: ProductDto[];
  categoryName: (id?: string) => string;
  onDelete: (product: ProductDto) => void;
  onEdit: (product: ProductDto) => void;
  onView: (product: ProductDto) => void;
  selected: Record<string, boolean>;
  onToggleSelect: (id: string, value: boolean) => void;
}

export function ProductsGrid({
  data,
  categoryName,
  onDelete,
  onEdit,
  onView,
  selected,
  onToggleSelect,
}: ProductsGridProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((product) => {
        const isSelected = selected[product.id] ?? false;
        return (
          <div
            key={product.id}
            className={cn(
              'group flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-colors',
              isSelected ? 'border-primary ring-1 ring-primary' : 'border-border/60',
            )}
          >
            <div className="relative aspect-[4/3] bg-muted">
              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : null}

              {/* Select checkbox */}
              <span
                className={cn(
                  'absolute left-3 top-3 rounded-md bg-card/90 p-0.5 shadow-sm backdrop-blur transition-opacity',
                  isSelected
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100 focus-within:opacity-100',
                )}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(v) => onToggleSelect(product.id, v === true)}
                  aria-label={`Select ${product.name}`}
                />
              </span>

              <span className="absolute right-3 top-3 flex items-center gap-1.5">
                <ProductStatusBadge status={product.status} />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="inline-flex size-8 items-center justify-center rounded-md bg-card/90 text-muted-foreground outline-none shadow-sm backdrop-blur transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label="Product actions"
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => onView(product)}>
                      View
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => onEdit(product)}>
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-danger focus:text-danger"
                      onSelect={() => onDelete(product)}
                    >
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1 p-4">
              <p className="truncate font-medium">{product.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {categoryName(product.category)}
                {product.createdAt ? ` · ${formatDate(product.createdAt)}` : ''}
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-lg font-semibold tracking-tight">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {product.sku}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

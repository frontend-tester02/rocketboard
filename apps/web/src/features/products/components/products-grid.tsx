'use client';

import type { ProductDto } from '@rocket/shared';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ProductStatusBadge } from '@/features/products/components/product-status-badge';
import { formatCurrency } from '@/lib/utils';

interface ProductsGridProps {
  data: ProductDto[];
  categoryName: (id?: string) => string;
  onDelete: (product: ProductDto) => void;
}

export function ProductsGrid({ data, categoryName, onDelete }: ProductsGridProps) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center text-sm text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {data.map((product) => (
        <div
          key={product.id}
          className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm"
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
            <span className="absolute left-3 top-3">
              <ProductStatusBadge status={product.status} />
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger
                className="absolute right-3 top-3 inline-flex size-8 items-center justify-center rounded-md bg-card/80 text-muted-foreground outline-none backdrop-blur transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Product actions"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View</DropdownMenuItem>
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem
                  className="text-danger focus:text-danger"
                  onSelect={() => onDelete(product)}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-1 flex-col gap-1 p-4">
            <p className="truncate font-medium">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              {categoryName(product.category)} · {product.sku}
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight">
              {formatCurrency(product.price)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

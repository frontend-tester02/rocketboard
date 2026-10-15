'use client';

import { Heart, Loader2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { ProductStatusBadge } from '@/features/products/components/product-status-badge';
import { useCategories, useProduct } from '@/features/products/hooks';
import { cn, formatCurrency } from '@/lib/utils';

export function ProductDetails({ id }: { id: string }) {
  const { data: product, isLoading, isError } = useProduct(id);
  const categoriesQuery = useCategories();
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="py-20 text-center text-sm text-danger">
        Product not found.
      </div>
    );
  }

  const categoryName =
    categoriesQuery.data?.find((c) => c.id === product.category)?.name ?? '—';
  const images = product.images.length ? product.images : [''];
  const specs: { label: string; value: string }[] = [
    { label: 'SKU', value: product.sku },
    { label: 'Category', value: categoryName },
    { label: 'Stock', value: `${product.stock}` },
    ...(product.taxRule ? [{ label: 'Tax rule', value: product.taxRule }] : []),
    ...(product.shipping?.weight != null
      ? [{ label: 'Weight', value: `${product.shipping.weight} kg` }]
      : []),
    ...(product.shipping?.width != null
      ? [
          {
            label: 'Dimensions',
            value: `${product.shipping.width} × ${product.shipping.height ?? '—'} × ${product.shipping.length ?? '—'} cm`,
          },
        ]
      : []),
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Gallery */}
      <div className="flex flex-col gap-3">
        <div className="aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted">
          {images[activeImage] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={images[activeImage]}
              alt={product.name}
              className="size-full object-cover"
            />
          ) : null}
        </div>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={cn(
                  'size-16 shrink-0 overflow-hidden rounded-lg border bg-muted',
                  i === activeImage ? 'border-primary ring-1 ring-primary' : 'border-border/60',
                )}
              >
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt="" className="size-full object-cover" />
                ) : null}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <ProductStatusBadge status={product.status} />
            <h2 className="mt-2 text-xl font-semibold tracking-tight">
              {product.name}
            </h2>
            <p className="text-sm text-muted-foreground">{product.sku}</p>
          </div>
          <button
            type="button"
            onClick={() => setFavorite((f) => !f)}
            aria-label="Toggle favorite"
            aria-pressed={favorite}
            className={cn(
              'inline-flex size-10 shrink-0 items-center justify-center rounded-lg border transition-colors',
              favorite
                ? 'border-danger/30 bg-danger/10 text-danger'
                : 'border-border/60 text-muted-foreground hover:text-foreground',
            )}
          >
            <Heart className={cn('size-5', favorite && 'fill-current')} />
          </button>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold tracking-tight">
            {formatCurrency(product.price)}
          </span>
          {product.taxIncludedPrice != null && (
            <span className="text-sm text-muted-foreground">
              {formatCurrency(product.taxIncludedPrice)} incl. tax
            </span>
          )}
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {product.description}
          </p>
        )}

        {/* Quantity + actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Decrease quantity"
              className="inline-flex size-10 items-center justify-center rounded-l-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Minus className="size-4" />
            </button>
            <span className="flex h-10 w-12 items-center justify-center border-y border-input text-sm font-medium">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => q + 1)}
              aria-label="Increase quantity"
              className="inline-flex size-10 items-center justify-center rounded-r-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Plus className="size-4" />
            </button>
          </div>
          <Button
            className="gap-1.5"
            disabled={product.stock === 0}
            onClick={() => toast.success(`Added ${qty} × ${product.name} to cart`)}
          >
            <ShoppingCart className="size-4" />
            {product.stock === 0 ? 'Out of stock' : 'Add to Cart'}
          </Button>
        </div>

        {/* Tags */}
        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Specifications */}
        <div className="mt-2">
          <h3 className="mb-2 text-sm font-semibold">Specifications</h3>
          <dl className="divide-y divide-border/60 rounded-lg border border-border/60">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
              >
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="font-medium">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

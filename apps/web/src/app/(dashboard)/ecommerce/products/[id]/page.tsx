'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProductDetails } from '@/features/products/components/product-details';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/ecommerce/products"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Back to products
      </Link>

      <div className="rounded-xl border border-border/60 bg-card p-6 shadow-sm">
        <ProductDetails id={id} />
      </div>
    </div>
  );
}

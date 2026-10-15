'use client';

import { useParams, useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProductDetails } from '@/features/products/components/product-details';

export default function ProductDetailModal() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  return (
    <Dialog open onOpenChange={(o) => !o && router.back()}>
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Product Details</DialogTitle>
        </DialogHeader>
        <div className="max-h-[75vh] overflow-y-auto p-6">
          <ProductDetails id={id} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

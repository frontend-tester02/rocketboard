import { Suspense } from 'react';
import { OrdersPageClient } from '@/features/orders/components/orders-page-client';

export default function OrdersPage() {
  return (
    <Suspense fallback={null}>
      <OrdersPageClient />
    </Suspense>
  );
}

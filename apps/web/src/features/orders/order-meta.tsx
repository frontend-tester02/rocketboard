import { OrderStatus, PaymentType } from '@rocket/shared';
import { StatusBadge, type StatusVariant } from '@/components/common/status-badge';

const statusMeta: Record<OrderStatus, { variant: StatusVariant; label: string }> = {
  [OrderStatus.Pending]: { variant: 'neutral', label: 'Pending' },
  [OrderStatus.Processing]: { variant: 'warning', label: 'Processing' },
  [OrderStatus.Shipped]: { variant: 'success', label: 'Shipped' },
  [OrderStatus.Refunded]: { variant: 'danger', label: 'Refunded' },
  [OrderStatus.Cancelled]: { variant: 'danger', label: 'Cancelled' },
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { variant, label } = statusMeta[status];
  return <StatusBadge variant={variant}>{label}</StatusBadge>;
}

export const paymentLabels: Record<PaymentType, string> = {
  [PaymentType.Card]: 'Credit Card',
  [PaymentType.Paypal]: 'PayPal',
  [PaymentType.BankTransfer]: 'Bank Transfer',
  [PaymentType.Cash]: 'Cash',
};

/** Tab definitions for the orders list. */
export const orderTabs: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: OrderStatus.Pending, label: 'Pending' },
  { value: OrderStatus.Processing, label: 'Processing' },
  { value: OrderStatus.Shipped, label: 'Shipped' },
  { value: OrderStatus.Refunded, label: 'Refunded' },
  { value: OrderStatus.Cancelled, label: 'Cancelled' },
];

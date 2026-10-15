import { ProductStatus } from '@rocket/shared';
import { StatusBadge, type StatusVariant } from '@/components/common/status-badge';

const map: Record<ProductStatus, { variant: StatusVariant; label: string }> = {
  [ProductStatus.Available]: { variant: 'success', label: 'Available' },
  [ProductStatus.Disabled]: { variant: 'neutral', label: 'Disabled' },
};

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const { variant, label } = map[status];
  return <StatusBadge variant={variant}>{label}</StatusBadge>;
}

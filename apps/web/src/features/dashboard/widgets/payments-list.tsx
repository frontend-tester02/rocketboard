import { Card } from '@/components/common/card';
import { categoryMeta } from '@/features/dashboard/category-meta';
import { payments } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

function amountLabel(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

export function PaymentsList() {
  return (
    <Card title="Payments" menu bodyClassName="flex flex-col">
      {payments.map((payment, i) => {
        const { icon: Icon, className } = categoryMeta[payment.category];
        return (
          <div
            key={payment.id}
            className={cn(
              'flex items-center gap-3 py-3',
              i !== 0 && 'border-t border-border/60',
            )}
          >
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-lg',
                className,
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{payment.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {payment.time}
              </p>
            </div>
            <p
              className={cn(
                'text-sm font-semibold',
                payment.amount >= 0 ? 'text-success' : 'text-foreground',
              )}
            >
              {amountLabel(payment.amount)}
            </p>
          </div>
        );
      })}
    </Card>
  );
}

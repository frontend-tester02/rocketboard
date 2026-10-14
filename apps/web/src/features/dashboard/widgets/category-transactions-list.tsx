import {
  Dumbbell,
  Pill,
  Plane,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import { Card } from '@/components/common/card';
import { categoryTransactions, type TxCategory } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

const meta: Record<TxCategory, { icon: LucideIcon; className: string }> = {
  shopping: { icon: ShoppingBag, className: 'bg-primary/10 text-primary' },
  travel: { icon: Plane, className: 'bg-warning/15 text-warning' },
  food: { icon: UtensilsCrossed, className: 'bg-success/10 text-success' },
  medicine: { icon: Pill, className: 'bg-danger/10 text-danger' },
  sport: { icon: Dumbbell, className: 'bg-muted text-muted-foreground' },
};

function amountLabel(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

export function CategoryTransactionsList() {
  return (
    <Card title="Transactions" menu bodyClassName="flex flex-col">
      {categoryTransactions.map((tx, i) => {
        const { icon: Icon, className } = meta[tx.category];
        return (
          <div
            key={tx.id}
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
              <p className="truncate text-sm font-medium">{tx.title}</p>
              <p className="truncate text-xs text-muted-foreground">{tx.time}</p>
            </div>
            <p
              className={cn(
                'text-sm font-semibold',
                tx.amount >= 0 ? 'text-success' : 'text-foreground',
              )}
            >
              {amountLabel(tx.amount)}
            </p>
          </div>
        );
      })}
    </Card>
  );
}

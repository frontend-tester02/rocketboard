import { Card } from '@/components/common/card';
import { categoryMeta } from '@/features/dashboard/category-meta';
import { categoryTransactions } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

function amountLabel(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

export function CategoryTransactionsList() {
  return (
    <Card title="Transactions" menu bodyClassName="flex flex-col">
      {categoryTransactions.map((tx, i) => {
        const { icon: Icon, className } = categoryMeta[tx.category];
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

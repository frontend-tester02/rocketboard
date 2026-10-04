import { Card } from '@/components/common/card';
import { UserAvatar } from '@/components/common/user-avatar';
import { transactions } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

function amountLabel(amount: number): string {
  const sign = amount >= 0 ? '+' : '-';
  return `${sign}$${Math.abs(amount).toLocaleString()}`;
}

export function TransactionsList() {
  return (
    <Card title="Transactions" menu bodyClassName="flex flex-col">
      {transactions.map((tx, i) => (
        <div
          key={tx.id}
          className={cn(
            'flex items-center gap-3 py-3',
            i !== 0 && 'border-t border-border/60',
          )}
        >
          <UserAvatar name={tx.name} className="size-9" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{tx.name}</p>
            <p className="truncate text-xs text-muted-foreground">{tx.when}</p>
          </div>
          <div className="text-right">
            <p
              className={cn(
                'text-sm font-semibold',
                tx.amount >= 0 ? 'text-success' : 'text-danger',
              )}
            >
              {amountLabel(tx.amount)}
            </p>
            <p className="text-xs text-muted-foreground">{tx.type}</p>
          </div>
        </div>
      ))}
    </Card>
  );
}

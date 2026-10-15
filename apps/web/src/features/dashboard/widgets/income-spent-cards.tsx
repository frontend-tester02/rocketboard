import {
  ArrowDownLeft,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { walletSummary } from '@/features/dashboard/mock';
import { cn, formatCurrency } from '@/lib/utils';

function MoneyCard({
  label,
  amount,
  change,
  tone,
}: {
  label: string;
  amount: number;
  change: number;
  tone: 'income' | 'spent';
}) {
  const positive = change >= 0;
  const Trend = positive ? TrendingUp : TrendingDown;
  const Arrow = tone === 'income' ? ArrowDownLeft : ArrowUpRight;
  const iconClass =
    tone === 'income'
      ? 'bg-success/10 text-success'
      : 'bg-danger/10 text-danger';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-5 shadow-sm">
      <span
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          iconClass,
        )}
      >
        <Arrow className="size-5" />
      </span>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight">
          {formatCurrency(amount)}
        </p>
      </div>
      <span
        className={cn(
          'inline-flex items-center gap-0.5 text-xs font-medium',
          positive ? 'text-success' : 'text-danger',
        )}
      >
        <Trend className="size-3.5" />
        {Math.abs(change)}% vs last month
      </span>
    </div>
  );
}

export function IncomeSpentCards() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
      <MoneyCard
        label="Income"
        amount={walletSummary.income.value}
        change={walletSummary.income.change}
        tone="income"
      />
      <MoneyCard
        label="Spent"
        amount={walletSummary.spent.value}
        change={walletSummary.spent.change}
        tone="spent"
      />
    </div>
  );
}

import { Card } from '@/components/common/card';
import { Button } from '@/components/ui/button';
import { cardDetails, myCard } from '@/features/dashboard/mock';
import { formatCurrency } from '@/lib/utils';

function VisaCard() {
  return (
    <div className="relative flex aspect-[1.6/1] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-indigo-600 p-5 text-white shadow-md">
      <div
        aria-hidden
        className="absolute -right-8 -top-8 size-32 rounded-full bg-warning/40"
      />
      <div
        aria-hidden
        className="absolute -bottom-10 -right-2 size-28 rounded-full bg-white/10"
      />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs text-white/70">Current Balance</p>
          <p className="mt-1 text-xl font-semibold">
            {formatCurrency(myCard.balance)}
          </p>
        </div>
        <span className="text-lg font-bold italic tracking-wide">
          {myCard.brand}
        </span>
      </div>
      <div className="relative">
        <p className="font-mono text-base tracking-[0.2em]">{myCard.number}</p>
        <p className="mt-2 text-sm text-white/80">{myCard.holder}</p>
      </div>
    </div>
  );
}

export function MyCardsWidget() {
  return (
    <Card title="My Cards" menu>
      <div className="grid gap-5 sm:grid-cols-2">
        <VisaCard />
        <dl className="flex flex-col justify-center gap-2.5 text-sm">
          {cardDetails.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button>Add Card</Button>
        <Button variant="secondary">Pay Debt</Button>
        <Button variant="ghost">Cancel</Button>
      </div>
    </Card>
  );
}

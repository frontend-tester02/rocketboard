'use client';

import { MoreHorizontal, TrendingDown, TrendingUp } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { balance } from '@/features/dashboard/mock';
import { formatCurrency } from '@/lib/utils';

export function BalanceCard() {
  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-xl bg-primary p-5 text-primary-foreground shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-primary-foreground/80">Balance</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight">
            {formatCurrency(balance.amount)}
          </p>
        </div>
        <button
          type="button"
          className="text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          aria-label="More"
        >
          <MoreHorizontal className="size-5" />
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 h-24 opacity-70">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={balance.wave} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceWave" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke="#ffffff"
              strokeWidth={2.5}
              fill="url(#balanceWave)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="relative mt-6 flex items-center gap-5 text-sm">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-white/15">
            <TrendingUp className="size-4" />
          </span>
          <div>
            <p className="font-semibold leading-none">
              {formatCurrency(balance.income)}
            </p>
            <p className="text-xs text-primary-foreground/70">Income</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-md bg-white/15">
            <TrendingDown className="size-4" />
          </span>
          <div>
            <p className="font-semibold leading-none">
              {formatCurrency(balance.spending)}
            </p>
            <p className="text-xs text-primary-foreground/70">Spending</p>
          </div>
        </div>
      </div>
    </div>
  );
}

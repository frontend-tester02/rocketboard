'use client';

import { useState } from 'react';
import { walletCards } from '@/features/dashboard/mock';
import { cn, formatCurrency } from '@/lib/utils';

export function CardsCarousel() {
  const [active, setActive] = useState(0);
  const card = walletCards[active]!;

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          'relative flex aspect-[1.6/1] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-md',
          card.gradient,
        )}
      >
        <div
          aria-hidden
          className="absolute -right-8 -top-8 size-32 rounded-full bg-white/10"
        />
        <div
          aria-hidden
          className="absolute -bottom-10 -right-2 size-28 rounded-full bg-white/10"
        />
        <div className="relative flex items-start justify-between">
          <div>
            <p className="text-xs text-white/70">Current Balance</p>
            <p className="mt-1 text-xl font-semibold">
              {formatCurrency(card.balance)}
            </p>
          </div>
          <span className="text-lg font-bold italic tracking-wide">
            {card.brand}
          </span>
        </div>
        <div className="relative">
          <p className="font-mono text-base tracking-[0.2em]">{card.number}</p>
          <p className="mt-2 text-sm text-white/80">{card.holder}</p>
        </div>
      </div>

      {/* Dot pagination */}
      <div className="flex items-center justify-center gap-2">
        {walletCards.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActive(i)}
            aria-label={`Show card ${i + 1}`}
            aria-current={i === active}
            className={cn(
              'h-2 rounded-full transition-all',
              i === active ? 'w-6 bg-primary' : 'w-2 bg-border',
            )}
          />
        ))}
      </div>
    </div>
  );
}

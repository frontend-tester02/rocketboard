'use client';

import { CreditCard, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { CustomerFormValues } from '@/features/customers/customer-form-schema';
import { detectBrand, luhnValid } from '@/features/dashboard/add-card-schema';
import { cn } from '@/lib/utils';

function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

const months = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 12 }, (_, i) => String(currentYear + i));

export function PaymentStep({ form }: { form: UseFormReturn<CustomerFormValues> }) {
  const { control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'paymentMethods',
  });

  const [number, setNumber] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [error, setError] = useState<string | null>(null);

  const brand = number ? detectBrand(number) : 'Card';

  function addCard() {
    if (!luhnValid(number)) {
      setError('Enter a valid card number');
      return;
    }
    if (!month || !year) {
      setError('Select an expiry date');
      return;
    }
    const digits = number.replace(/\D/g, '');
    append({
      brand: detectBrand(number),
      last4: digits.slice(-4),
      expMonth: Number(month),
      expYear: Number(year),
    });
    setNumber('');
    setMonth('');
    setYear('');
    setError(null);
  }

  return (
    <div className="space-y-4">
      {/* Saved cards */}
      {fields.length > 0 && (
        <div className="space-y-2">
          {fields.map((field, i) => {
            const card = form.watch(`paymentMethods.${i}`);
            if (!card) return null;
            return (
              <div
                key={field.id}
                className="flex items-center gap-3 rounded-lg border border-border/60 p-3"
              >
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <CreditCard className="size-5" />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">
                    {card.brand} •••• {card.last4}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {String(card.expMonth).padStart(2, '0')}/{card.expYear}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label="Remove card"
                  className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add card */}
      <div className="space-y-3 rounded-xl border border-border/60 p-4">
        <p className="text-sm font-medium">Add card</p>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Card Number</Label>
          <div className="relative">
            <Input
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              value={number}
              onChange={(e) => setNumber(formatCardNumber(e.target.value))}
              className={cn('pr-16', error && 'border-danger focus-visible:ring-danger')}
            />
            <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-semibold text-muted-foreground">
              <CreditCard className="size-4" />
              {brand !== 'Card' && brand}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Month</Label>
            <Select value={month} onValueChange={setMonth}>
              <SelectTrigger>
                <SelectValue placeholder="MM" />
              </SelectTrigger>
              <SelectContent>
                {months.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Year</Label>
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger>
                <SelectValue placeholder="YYYY" />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <Button type="button" variant="outline" className="w-full gap-1.5" onClick={addCard}>
          <Plus className="size-4" />
          Add card
        </Button>
        <p className="text-xs text-muted-foreground">
          Only the card brand and last 4 digits are stored.
        </p>
      </div>
    </div>
  );
}

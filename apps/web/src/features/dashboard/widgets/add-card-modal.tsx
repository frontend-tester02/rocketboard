'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Plus } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  addCardSchema,
  detectBrand,
  type AddCardValues,
} from '@/features/dashboard/add-card-schema';
import { useWalletCardsStore } from '@/features/dashboard/wallet-cards-store';
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

export function AddCardModal() {
  const [open, setOpen] = useState(false);
  const addCard = useWalletCardsStore((s) => s.addCard);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddCardValues>({
    resolver: zodResolver(addCardSchema),
    defaultValues: { number: '', holder: '', month: '', year: '' },
  });

  const numberValue = watch('number');
  const brand = numberValue ? detectBrand(numberValue) : 'Card';

  const onSubmit = handleSubmit((values) => {
    addCard({
      brand: detectBrand(values.number),
      holder: values.holder,
      number: formatCardNumber(values.number),
      balance: 0,
      gradient: 'from-primary to-indigo-600',
    });
    toast.success('Card added');
    reset();
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Add Card
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Card</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {/* Card number */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="number">Card Number</Label>
            <div className="relative">
              <Input
                id="number"
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                aria-invalid={!!errors.number}
                className={cn(
                  'pr-16',
                  errors.number && 'border-danger focus-visible:ring-danger',
                )}
                {...register('number')}
                value={numberValue}
                onChange={(e) =>
                  setValue('number', formatCardNumber(e.target.value), {
                    shouldValidate: !!errors.number,
                  })
                }
              />
              <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 text-xs font-semibold text-muted-foreground">
                <CreditCard className="size-4" />
                {brand !== 'Card' && brand}
              </span>
            </div>
            {errors.number && (
              <p className="text-xs text-danger">{errors.number.message}</p>
            )}
          </div>

          {/* Card holder */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="holder">Card Holder</Label>
            <Input
              id="holder"
              autoComplete="cc-name"
              placeholder="Felecia Brown"
              aria-invalid={!!errors.holder}
              className={cn(
                errors.holder && 'border-danger focus-visible:ring-danger',
              )}
              {...register('holder')}
            />
            {errors.holder && (
              <p className="text-xs text-danger">{errors.holder.message}</p>
            )}
          </div>

          {/* Expiry */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Month</Label>
              <Controller
                control={control}
                name="month"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={!!errors.month}
                      className={cn(
                        errors.month && 'border-danger focus-visible:ring-danger',
                      )}
                    >
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
                )}
              />
              {errors.month && (
                <p className="text-xs text-danger">{errors.month.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Year</Label>
              <Controller
                control={control}
                name="year"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger
                      aria-invalid={!!errors.year}
                      className={cn(
                        errors.year && 'border-danger focus-visible:ring-danger',
                      )}
                    >
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
                )}
              />
              {errors.year && (
                <p className="text-xs text-danger">{errors.year.message}</p>
              )}
            </div>
          </div>

          <Button type="submit" className="mt-1 w-full">
            Add Card
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

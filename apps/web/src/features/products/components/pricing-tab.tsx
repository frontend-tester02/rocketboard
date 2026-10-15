'use client';

import { useEffect } from 'react';
import type {
  Control,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { toast } from 'sonner';
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
  pricePerOptions,
  taxRules,
  type ProductFormValues,
} from '@/features/products/product-form-schema';

interface PricingTabProps {
  register: UseFormRegister<ProductFormValues>;
  control: Control<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
}

export function PricingTab({ register, control, watch, setValue }: PricingTabProps) {
  const price = watch('price');
  const taxRule = watch('taxRule');

  // Auto-calculate the tax-included price from the excluded price + rule.
  useEffect(() => {
    const base = Number(price);
    const rule = taxRules.find((r) => r.value === taxRule);
    if (!price || !Number.isFinite(base) || !rule) {
      setValue('taxIncludedPrice', '');
      return;
    }
    const included = base * (1 + rule.rate);
    setValue('taxIncludedPrice', included.toFixed(2));
  }, [price, taxRule, setValue]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="price">Tax excluded price</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="price"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className="pl-7"
              {...register('price')}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="taxIncludedPrice">Tax included price</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="taxIncludedPrice"
              readOnly
              placeholder="0.00"
              className="pl-7 bg-muted/50"
              {...register('taxIncludedPrice')}
            />
          </div>
          <p className="text-xs text-muted-foreground">Auto-calculated from the tax rule.</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label>Tax rule</Label>
          <button
            type="button"
            onClick={() => toast.info('Custom tax rules arrive in a later stage.')}
            className="text-xs font-medium text-primary transition-colors hover:text-primary/80"
          >
            + Create new tax
          </button>
        </div>
        <Controller
          control={control}
          name="taxRule"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {taxRules.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="unitPrice">Unit price</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              id="unitPrice"
              type="number"
              min={0}
              step="0.01"
              inputMode="decimal"
              placeholder="0.00"
              className="pl-7"
              {...register('unitPrice')}
            />
          </div>
          <Controller
            control={control}
            name="pricePer"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-32 shrink-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pricePerOptions.map((p) => (
                    <SelectItem key={p} value={p}>
                      per {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
}

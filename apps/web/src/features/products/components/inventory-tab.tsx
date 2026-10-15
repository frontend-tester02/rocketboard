'use client';

import { Minus, Plus } from 'lucide-react';
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
} from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductFormValues } from '@/features/products/product-form-schema';
import { cn } from '@/lib/utils';

interface InventoryTabProps {
  register: UseFormRegister<ProductFormValues>;
  watch: UseFormWatch<ProductFormValues>;
  setValue: UseFormSetValue<ProductFormValues>;
  errors: FieldErrors<ProductFormValues>;
}

export function InventoryTab({ register, watch, setValue, errors }: InventoryTabProps) {
  const stock = Number(watch('stock')) || 0;

  function setStock(next: number) {
    setValue('stock', String(Math.max(0, next)), { shouldDirty: true });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sku-inventory">SKU</Label>
        <Input
          id="sku-inventory"
          placeholder="SKU-1001"
          aria-invalid={!!errors.sku}
          className={cn(errors.sku && 'border-danger focus-visible:ring-danger')}
          {...register('sku')}
        />
        {errors.sku ? (
          <p className="text-xs text-danger">{errors.sku.message}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Unique product code. Checked for duplicates on save.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="stock">Quantity</Label>
        <div className="flex w-full max-w-48 items-center">
          <button
            type="button"
            onClick={() => setStock(stock - 1)}
            disabled={stock <= 0}
            aria-label="Decrease quantity"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-l-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
          >
            <Minus className="size-4" />
          </button>
          <Input
            id="stock"
            type="number"
            min={0}
            inputMode="numeric"
            className="h-10 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            {...register('stock')}
          />
          <button
            type="button"
            onClick={() => setStock(stock + 1)}
            aria-label="Increase quantity"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-r-md border border-input text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

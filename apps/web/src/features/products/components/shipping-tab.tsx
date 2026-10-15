'use client';

import type { UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ProductFormValues } from '@/features/products/product-form-schema';

interface ShippingTabProps {
  register: UseFormRegister<ProductFormValues>;
}

function DimField({
  id,
  label,
  unit,
  register,
  name,
}: {
  id: string;
  label: string;
  unit: string;
  register: UseFormRegister<ProductFormValues>;
  name: 'weight' | 'width' | 'height' | 'length';
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          placeholder="0"
          className="pr-10"
          {...register(name)}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

export function ShippingTab({ register }: ShippingTabProps) {
  return (
    <div className="space-y-4">
      <DimField id="weight" label="Weight" unit="kg" name="weight" register={register} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DimField id="width" label="Width" unit="cm" name="width" register={register} />
        <DimField id="height" label="Height" unit="cm" name="height" register={register} />
        <DimField id="length" label="Length" unit="cm" name="length" register={register} />
      </div>
      <p className="text-xs text-muted-foreground">
        Shipping dimensions are optional and used to estimate delivery rates.
      </p>
    </div>
  );
}

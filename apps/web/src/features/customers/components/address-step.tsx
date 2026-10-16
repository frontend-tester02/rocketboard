'use client';

import { MapPin, Plus, Trash2 } from 'lucide-react';
import { useFieldArray, type UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CustomerFormValues } from '@/features/customers/customer-form-schema';
import { cn } from '@/lib/utils';

const emptyAddress = {
  label: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  country: '',
  zip: '',
};

export function AddressStep({ form }: { form: UseFormReturn<CustomerFormValues> }) {
  const { control, register, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'addresses' });
  const errors = formState.errors.addresses;

  return (
    <div className="space-y-4">
      {fields.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          <MapPin className="size-6" />
          No addresses yet.
        </div>
      )}

      {fields.map((field, i) => {
        const err = errors?.[i];
        return (
          <div key={field.id} className="rounded-xl border border-border/60 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Address {i + 1}</p>
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label="Remove address"
                className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-danger"
              >
                <Trash2 className="size-4" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="Label" error={undefined}>
                <Input placeholder="Home / Office" {...register(`addresses.${i}.label`)} />
              </Field>
              <Field label="Street" error={err?.line1?.message}>
                <Input
                  placeholder="123 Market Street"
                  aria-invalid={!!err?.line1}
                  className={cn(err?.line1 && 'border-danger focus-visible:ring-danger')}
                  {...register(`addresses.${i}.line1`)}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="City" error={err?.city?.message}>
                  <Input
                    placeholder="New York"
                    aria-invalid={!!err?.city}
                    className={cn(err?.city && 'border-danger focus-visible:ring-danger')}
                    {...register(`addresses.${i}.city`)}
                  />
                </Field>
                <Field label="State / Region" error={undefined}>
                  <Input placeholder="NY" {...register(`addresses.${i}.state`)} />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Country" error={err?.country?.message}>
                  <Input
                    placeholder="USA"
                    aria-invalid={!!err?.country}
                    className={cn(err?.country && 'border-danger focus-visible:ring-danger')}
                    {...register(`addresses.${i}.country`)}
                  />
                </Field>
                <Field label="ZIP" error={undefined}>
                  <Input placeholder="10001" {...register(`addresses.${i}.zip`)} />
                </Field>
              </div>
            </div>
          </div>
        );
      })}

      <Button
        type="button"
        variant="outline"
        className="w-full gap-1.5"
        onClick={() => append(emptyAddress)}
      >
        <Plus className="size-4" />
        Add address
      </Button>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

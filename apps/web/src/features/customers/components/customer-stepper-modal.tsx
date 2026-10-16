'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Check, CheckCircle2, Loader2, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { AddressStep } from '@/features/customers/components/address-step';
import { PaymentStep } from '@/features/customers/components/payment-step';
import { SubmissionStep } from '@/features/customers/components/submission-step';
import { useCreateCustomer } from '@/features/customers/hooks';
import {
  customerFormDefaults,
  customerFormSchema,
  stepFields,
  toCreateCustomerInput,
  type CustomerFormValues,
} from '@/features/customers/customer-form-schema';
import { uploadImage } from '@/features/uploads/api';
import { cn } from '@/lib/utils';

const STEPS = ['Profile', 'Address', 'Payment', 'Submission'] as const;
type Step = (typeof STEPS)[number];

export function CustomerStepperModal() {
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const createCustomer = useCreateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: customerFormDefaults,
  });
  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = form;

  const step = STEPS[stepIndex]!;
  const isLast = stepIndex === STEPS.length - 1;
  const avatar = watch('avatar');

  function close() {
    setOpen(false);
    setStepIndex(0);
    setSubmitted(false);
    reset();
  }

  async function next() {
    const valid = await trigger(stepFields[step] as never);
    if (valid) setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  }

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadImage(file);
      setValue('avatar', res.url, { shouldDirty: true });
    } catch {
      toast.error('Avatar upload failed');
    } finally {
      setUploading(false);
    }
  }

  const onSubmit = handleSubmit((values) => {
    createCustomer.mutate(toCreateCustomerInput(values), {
      onSuccess: () => setSubmitted(true),
    });
  });

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? setOpen(true) : close())}>
      <DialogTrigger asChild>
        <Button className="gap-1.5">
          <Plus className="size-4" />
          Add Customer
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="flex flex-col items-center gap-4 px-6 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-success/10 text-success">
              <CheckCircle2 className="size-8" />
            </span>
            <div>
              <p className="text-lg font-semibold">Customer created</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {`${watch('firstName')} ${watch('lastName')}`} has been added.
              </p>
            </div>
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
        <>
        {/* Step indicator */}
        <div className="flex items-center gap-2 border-b border-border px-6 py-4">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center gap-2">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                  i < stepIndex && 'bg-primary text-primary-foreground',
                  i === stepIndex && 'bg-primary/15 text-primary ring-2 ring-primary',
                  i > stepIndex && 'bg-muted text-muted-foreground',
                )}
              >
                {i < stepIndex ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:inline',
                  i === stepIndex ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <span className="mx-1 hidden h-px flex-1 bg-border sm:block" />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={onSubmit}>
          <div className="max-h-[60vh] min-h-[18rem] overflow-y-auto px-6 py-5">
            {step === 'Profile' ? (
              <div className="space-y-4">
                {/* Avatar */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="group relative size-20 overflow-hidden rounded-full border border-border bg-muted"
                    aria-label="Upload avatar"
                  >
                    {uploading ? (
                      <span className="flex size-full items-center justify-center">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                      </span>
                    ) : avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar} alt="" className="size-full object-cover" />
                    ) : (
                      <span className="flex size-full items-center justify-center text-muted-foreground">
                        <Camera className="size-6" />
                      </span>
                    )}
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onPickAvatar}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Field label="First Name" error={errors.firstName?.message}>
                    <Input
                      placeholder="Felecia"
                      aria-invalid={!!errors.firstName}
                      {...register('firstName')}
                    />
                  </Field>
                  <Field label="Last Name" error={errors.lastName?.message}>
                    <Input
                      placeholder="Brown"
                      aria-invalid={!!errors.lastName}
                      {...register('lastName')}
                    />
                  </Field>
                </div>

                <Field label="Email" error={errors.email?.message}>
                  <Input
                    type="email"
                    placeholder="felecia@example.com"
                    aria-invalid={!!errors.email}
                    {...register('email')}
                  />
                </Field>

                <Field label="Phone" error={errors.phone?.message}>
                  <Input placeholder="+1 (704) 555-0127" {...register('phone')} />
                </Field>
              </div>
            ) : step === 'Address' ? (
              <AddressStep form={form} />
            ) : step === 'Payment' ? (
              <PaymentStep form={form} />
            ) : (
              <SubmissionStep form={form} onEdit={setStepIndex} />
            )}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-border px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => (stepIndex === 0 ? close() : setStepIndex((i) => i - 1))}
            >
              {stepIndex === 0 ? 'Cancel' : 'Back'}
            </Button>
            {isLast ? (
              <Button type="submit" disabled={createCustomer.isPending} className="gap-1.5">
                {createCustomer.isPending && <Loader2 className="size-4 animate-spin" />}
                Submit
              </Button>
            ) : (
              <Button type="button" onClick={next}>
                Next
              </Button>
            )}
          </div>
        </form>
        </>
        )}
      </DialogContent>
    </Dialog>
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
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

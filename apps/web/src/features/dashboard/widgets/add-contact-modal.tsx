'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, Plus } from 'lucide-react';
import { useRef, useState } from 'react';
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
  addContactSchema,
  countryCodes,
  type AddContactValues,
} from '@/features/dashboard/add-contact-schema';
import { useWalletContactsStore } from '@/features/dashboard/wallet-contacts-store';
import { cn } from '@/lib/utils';

export function AddContactModal() {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addContact = useWalletContactsStore((s) => s.addContact);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<AddContactValues>({
    resolver: zodResolver(addContactSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: '+1',
      phone: '',
      jobTitle: '',
    },
  });

  function clearForm() {
    reset();
    setPreview(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  const onSubmit = handleSubmit((values) => {
    const name = `${values.firstName} ${values.lastName}`.trim();
    addContact({
      name,
      role: values.jobTitle || `${values.countryCode} ${values.phone}`,
      avatar: preview ?? undefined,
    });
    toast.success('Contact added');
    reset();
    if (fileRef.current) fileRef.current.value = '';
    // Keep the object URL alive — it is now shown in the contacts list.
    setPreview(null);
    setOpen(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) clearForm();
      }}
    >
      <DialogTrigger
        className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Add contact"
      >
        <Plus className="size-4" />
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Contact</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          {/* Avatar upload preview */}
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="group relative size-20 overflow-hidden rounded-full border border-border bg-muted"
              aria-label="Upload avatar"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview}
                  alt="Avatar preview"
                  className="size-full object-cover"
                />
              ) : (
                <span className="flex size-full items-center justify-center text-muted-foreground">
                  <Camera className="size-6" />
                </span>
              )}
              <span className="absolute inset-0 hidden items-center justify-center bg-black/40 text-white group-hover:flex">
                <Camera className="size-5" />
              </span>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onPick}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                placeholder="Felecia"
                aria-invalid={!!errors.firstName}
                className={cn(errors.firstName && 'border-danger focus-visible:ring-danger')}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-xs text-danger">{errors.firstName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                placeholder="Brown"
                aria-invalid={!!errors.lastName}
                className={cn(errors.lastName && 'border-danger focus-visible:ring-danger')}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-xs text-danger">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="felecia@rocket.io"
              aria-invalid={!!errors.email}
              className={cn(errors.email && 'border-danger focus-visible:ring-danger')}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-danger">{errors.email.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phone">Phone</Label>
            <div className="flex gap-2">
              <Controller
                control={control}
                name="countryCode"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-28 shrink-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countryCodes.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <Input
                id="phone"
                inputMode="tel"
                placeholder="704 555 0127"
                aria-invalid={!!errors.phone}
                className={cn('flex-1', errors.phone && 'border-danger focus-visible:ring-danger')}
                {...register('phone')}
              />
            </div>
            {errors.phone && (
              <p className="text-xs text-danger">{errors.phone.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              placeholder="Product Manager"
              {...register('jobTitle')}
            />
          </div>

          <Button type="submit" className="mt-1 w-full">
            Add Contact
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { createContactSchema, type ContactDto, type CreateContactInput } from '@rocket/shared';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TagInput } from '@/features/products/components/tag-input';
import { useCreateContact, useUpdateContact } from '@/features/contacts/hooks';

type FormValues = CreateContactInput;

const empty: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  jobTitle: '',
  address: '',
  isFavorite: false,
  tags: [],
};

function toForm(contact: ContactDto): FormValues {
  return {
    firstName: contact.firstName,
    lastName: contact.lastName,
    email: contact.email,
    phone: contact.phone,
    company: contact.company,
    jobTitle: contact.jobTitle,
    address: contact.address,
    isFavorite: contact.isFavorite,
    tags: contact.tags,
  };
}

export function ContactFormModal({
  contact,
  open,
  onOpenChange,
}: {
  /** Omit for create mode. */
  contact?: ContactDto | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const isEdit = Boolean(contact);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createContactSchema),
    defaultValues: empty,
  });

  useEffect(() => {
    if (open) reset(contact ? toForm(contact) : empty);
  }, [open, contact, reset]);

  const onSubmit = handleSubmit((values) => {
    if (isEdit && contact) {
      updateContact.mutate(
        { id: contact.id, input: values },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      createContact.mutate(values, { onSuccess: () => onOpenChange(false) });
    }
  });

  const pending = createContact.isPending || updateContact.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit contact' : 'Add contact'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="First name" error={errors.firstName?.message}>
              <Input {...register('firstName')} placeholder="Jane" />
            </Field>
            <Field label="Last name">
              <Input {...register('lastName')} placeholder="Doe" />
            </Field>
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" {...register('email')} placeholder="jane@example.com" />
            </Field>
            <Field label="Phone">
              <Input {...register('phone')} placeholder="+1 555 000 1234" />
            </Field>
            <Field label="Company">
              <Input {...register('company')} placeholder="Acme Inc." />
            </Field>
            <Field label="Job title">
              <Input {...register('jobTitle')} placeholder="Product Designer" />
            </Field>
          </div>

          <Field label="Address">
            <Input {...register('address')} placeholder="123 Market St, City" />
          </Field>

          <Field label="Tags">
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <TagInput value={field.value ?? []} onChange={field.onChange} />
              )}
            />
          </Field>

          <Controller
            control={control}
            name="isFavorite"
            render={({ field }) => (
              <label className="flex w-fit cursor-pointer items-center gap-2 text-sm">
                <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(!!v)} />
                Mark as favorite
              </label>
            )}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Add contact'}
            </Button>
          </DialogFooter>
        </form>
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

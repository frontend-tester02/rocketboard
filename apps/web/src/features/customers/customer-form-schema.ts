// Shared form schema for the Add Customer stepper (stages 33–36).
// Profile (33) · Address (34) · Payment (35) · Submission (36).
import {
  addressSchema,
  paymentMethodSchema,
  type CreateCustomerInput,
} from '@rocket/shared';
import { z } from 'zod';

export const customerFormSchema = z.object({
  // Profile (33)
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  phone: z.string().trim().max(40).optional(),
  avatar: z.string().optional(),
  // Address (34) / Payment (35)
  addresses: z.array(addressSchema).default([]),
  paymentMethods: z.array(paymentMethodSchema).default([]),
});

export type CustomerFormValues = z.input<typeof customerFormSchema>;

export const customerFormDefaults: CustomerFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  avatar: '',
  addresses: [],
  paymentMethods: [],
};

export function toCreateCustomerInput(
  values: CustomerFormValues,
): CreateCustomerInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone || undefined,
    avatar: values.avatar || undefined,
    addresses: values.addresses ?? [],
    paymentMethods: values.paymentMethods ?? [],
  };
}

/** Field names validated when leaving each step. */
export const stepFields = {
  Profile: ['firstName', 'lastName', 'email', 'phone', 'avatar'],
  Address: ['addresses'],
  Payment: ['paymentMethods'],
  Submission: [],
} as const;

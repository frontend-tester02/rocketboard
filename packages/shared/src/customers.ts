// Customer contracts shared between web and api.
import { z } from 'zod';
import { paginationQuerySchema } from './pagination';

export const addressSchema = z.object({
  label: z.string().trim().max(40).optional(),
  line1: z.string().trim().min(1, 'Street is required').max(160),
  line2: z.string().trim().max(160).optional(),
  city: z.string().trim().min(1, 'City is required').max(80),
  state: z.string().trim().max(80).optional(),
  country: z.string().trim().min(1, 'Country is required').max(80),
  zip: z.string().trim().max(20).optional(),
});
export type Address = z.infer<typeof addressSchema>;

/** Stored payment method — brand + last4 only, never the full card number. */
export const paymentMethodSchema = z.object({
  brand: z.string().trim().min(1).max(40),
  last4: z.string().trim().regex(/^\d{4}$/, '4 digits'),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2000).max(2100),
});
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(40).optional(),
  avatar: z.string().trim().url().optional(),
  addresses: z.array(addressSchema).optional().default([]),
  paymentMethods: z.array(paymentMethodSchema).optional().default([]),
});
export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type CreateCustomerInput = z.input<typeof createCustomerSchema>;

export const updateCustomerSchema = createCustomerSchema.partial();
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export const customerListQuerySchema = paginationQuerySchema;
export type CustomerListQuery = z.infer<typeof customerListQuerySchema>;

export interface CustomerDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  ordersCount: number;
  totalSpent: number;
  createdAt?: string;
  updatedAt?: string;
}

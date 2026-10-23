// Contacts contracts shared between web and api.
import { z } from 'zod';

const optionalEmail = z.union([z.string().trim().email(), z.literal('')]);

export const createContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().max(100).optional().default(''),
  email: optionalEmail.optional().default(''),
  phone: z.string().trim().max(40).optional().default(''),
  company: z.string().trim().max(100).optional().default(''),
  jobTitle: z.string().trim().max(100).optional().default(''),
  avatar: z.string().trim().max(500).optional(),
  address: z.string().trim().max(300).optional().default(''),
  isFavorite: z.boolean().optional().default(false),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
});
export type CreateContact = z.infer<typeof createContactSchema>;
export type CreateContactInput = z.input<typeof createContactSchema>;

export const updateContactSchema = createContactSchema.partial();
export type UpdateContact = z.infer<typeof updateContactSchema>;

export const contactListQuerySchema = z.object({
  search: z.string().trim().optional(),
  favorite: z.coerce.boolean().optional(),
});
export type ContactListQuery = z.infer<typeof contactListQuerySchema>;

export interface ContactDto {
  id: string;
  owner: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  avatar?: string;
  address: string;
  isFavorite: boolean;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

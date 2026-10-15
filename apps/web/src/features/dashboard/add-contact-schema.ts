import { z } from 'zod';

export const countryCodes = [
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+44', label: '🇬🇧 +44' },
  { value: '+49', label: '🇩🇪 +49' },
  { value: '+91', label: '🇮🇳 +91' },
  { value: '+998', label: '🇺🇿 +998' },
] as const;

export const addContactSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(40),
  lastName: z.string().min(1, 'Last name is required').max(40),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  countryCode: z.string().min(1, 'Code'),
  phone: z
    .string()
    .min(4, 'Phone is required')
    .regex(/^[0-9\s-]+$/, 'Digits only'),
  jobTitle: z.string().max(60).optional().or(z.literal('')),
});

export type AddContactValues = z.infer<typeof addContactSchema>;

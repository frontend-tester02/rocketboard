import { z } from 'zod';

/** Luhn checksum — validates most card numbers. */
export function luhnValid(digits: string): boolean {
  const clean = digits.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let double = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let d = Number(clean[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Detect the card brand from the leading digits. */
export function detectBrand(digits: string): string {
  const clean = digits.replace(/\D/g, '');
  if (/^4/.test(clean)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(clean)) return 'Mastercard';
  if (/^3[47]/.test(clean)) return 'Amex';
  if (/^6/.test(clean)) return 'Discover';
  return 'Card';
}

const currentYear = new Date().getFullYear();

export const addCardSchema = z.object({
  number: z
    .string()
    .min(1, 'Card number is required')
    .refine((v) => luhnValid(v), 'Enter a valid card number'),
  holder: z
    .string()
    .min(2, 'Card holder is required')
    .max(60, 'Name is too long'),
  month: z
    .string()
    .min(1, 'Month is required')
    .refine((v) => {
      const m = Number(v);
      return m >= 1 && m <= 12;
    }, 'Invalid month'),
  year: z
    .string()
    .min(1, 'Year is required')
    .refine((v) => {
      const y = Number(v);
      return y >= currentYear && y <= currentYear + 15;
    }, 'Invalid year'),
});

export type AddCardValues = z.infer<typeof addCardSchema>;

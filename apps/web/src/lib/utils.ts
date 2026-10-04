import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge conditional class names, de-duplicating conflicting Tailwind classes. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a number as currency (default USD). */
export function formatCurrency(
  value: number,
  options: { currency?: string; locale?: string } = {},
): string {
  const { currency = 'USD', locale = 'en-US' } = options;
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

/** Format a date (Date | string | number) as a readable date, e.g. "Aug 19, 2025". */
export function formatDate(
  value: Date | string | number,
  options: Intl.DateTimeFormatOptions = {},
  locale = 'en-US',
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date);
}

// Wallet (cards + transactions) contracts shared between web and api.
import { z } from 'zod';
import { TransactionType, transactionTypeSchema } from './enums';

// ── Cards ────────────────────────────────────────────────────────────────────
export const createCardSchema = z.object({
  brand: z.string().trim().min(1).max(30),
  last4: z.string().trim().regex(/^\d{4}$/, 'Must be the last 4 digits'),
  holder: z.string().trim().min(1).max(100),
  expMonth: z.coerce.number().int().min(1).max(12),
  expYear: z.coerce.number().int().min(2000).max(2100),
  balance: z.coerce.number().optional().default(0),
});
export type CreateCard = z.infer<typeof createCardSchema>;
export type CreateCardInput = z.input<typeof createCardSchema>;

export const updateCardSchema = createCardSchema.partial();
export type UpdateCard = z.infer<typeof updateCardSchema>;

export interface CardDto {
  id: string;
  owner: string;
  brand: string;
  last4: string;
  holder: string;
  expMonth: number;
  expYear: number;
  balance: number;
  createdAt?: string;
  updatedAt?: string;
}

// ── Transactions ──────────────────────────────────────────────────────────────
export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  category: z.string().trim().max(50).optional().default('other'),
  amount: z.coerce.number().positive(),
  title: z.string().trim().min(1).max(160),
  date: z.coerce.date().optional(),
  cardId: z.string().trim().min(1).optional(),
});
export type CreateTransaction = z.infer<typeof createTransactionSchema>;
export type CreateTransactionInput = z.input<typeof createTransactionSchema>;

export const transactionListQuerySchema = z.object({
  type: transactionTypeSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
});
export type TransactionListQuery = z.infer<typeof transactionListQuerySchema>;

export interface TransactionDto {
  id: string;
  owner: string;
  type: TransactionType;
  category: string;
  amount: number;
  title: string;
  date: string;
  cardId?: string;
  createdAt?: string;
}

export interface WalletSummary {
  balance: number;
  income: number;
  expense: number;
}

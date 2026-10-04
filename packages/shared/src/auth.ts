// Auth contracts shared between web (forms) and api (validation).
import { z } from 'zod';
import { userRoleSchema } from './enums';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Public, safe user shape returned by the api (never includes secrets). */
export const publicUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: userRoleSchema,
  avatar: z.string().optional(),
  jobTitle: z.string().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  isLocked: z.boolean(),
});
export type PublicUser = z.infer<typeof publicUserSchema>;

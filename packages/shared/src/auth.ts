// Auth contracts shared between web (forms) and api (validation).
import { z } from 'zod';
import { userRoleSchema } from './enums';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});
/** Validated/parsed login payload (what the api receives). */
export type LoginInput = z.infer<typeof loginSchema>;
/** Raw form values before parsing (what React Hook Form holds). */
export type LoginFormValues = z.input<typeof loginSchema>;

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(50),
  lastName: z.string().trim().min(1, 'Last name is required').max(50),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export type RegisterInput = z.infer<typeof registerSchema>;

/** Registration form (UI): single "Full Name" field + confirm + terms. */
export const registerFormSchema = z
  .object({
    fullName: z.string().trim().min(1, 'Full name is required').max(100),
    email: z.string().trim().toLowerCase().email(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean(),
  })
  .refine((d) => d.acceptTerms === true, {
    message: 'You must accept the terms and conditions',
    path: ['acceptTerms'],
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type RegisterFormValues = z.input<typeof registerFormSchema>;

/** Split a full name into first/last for the api's register contract. */
export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? fullName.trim();
  const lastName = parts.slice(1).join(' ') || firstName;
  return { firstName, lastName };
}

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

/** Unlock the lock screen with the account password. */
export const unlockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});
export type UnlockInput = z.infer<typeof unlockSchema>;

/** Reset payload sent to the api (token comes from the emailed link). */
export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Reset form (UI): new password + confirmation. */
export const resetPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
export type ResetPasswordFormValues = z.input<typeof resetPasswordFormSchema>;

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

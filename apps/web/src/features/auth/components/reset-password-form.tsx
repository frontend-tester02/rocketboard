'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  resetPasswordFormSchema,
  type ResetPasswordFormValues,
} from '@rocket/shared';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthLockIcon } from '@/features/auth/components/auth-lock-icon';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useResetPassword } from '@/features/auth/hooks';
import { toApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const reset = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit((values) => {
    reset.mutate(
      { token, password: values.password },
      {
        onSuccess: () => {
          toast.success('Password reset. Please sign in.');
          router.replace('/login');
        },
        onError: (error) => {
          const api = toApiError(error);
          toast.error(
            typeof api?.message === 'string'
              ? api.message
              : 'Could not reset password',
          );
        },
      },
    );
  });

  const apiError = reset.isError ? toApiError(reset.error) : null;

  return (
    <div className="flex flex-col gap-6">
      <AuthLockIcon />
      <h1 className="text-center text-xl font-semibold tracking-tight">
        Reset Your Password
      </h1>

      {apiError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {typeof apiError.message === 'string'
            ? apiError.message
            : 'Invalid or expired reset token'}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className={cn(errors.password && 'border-danger focus-visible:ring-danger')}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-invalid={!!errors.confirmPassword}
            className={cn(
              errors.confirmPassword && 'border-danger focus-visible:ring-danger',
            )}
            {...register('confirmPassword')}
          />
          {errors.confirmPassword && (
            <p className="text-xs text-danger">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" disabled={reset.isPending} className="w-full">
          {reset.isPending && <Loader2 className="size-4 animate-spin" />}
          Reset Password
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Go back to Login
        </Link>
      </p>
    </div>
  );
}

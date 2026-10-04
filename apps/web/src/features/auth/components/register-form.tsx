'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  registerFormSchema,
  splitFullName,
  type RegisterFormValues,
} from '@rocket/shared';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { GoogleButton } from '@/features/auth/components/google-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useRegister } from '@/features/auth/hooks';
import { toApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const acceptTerms = watch('acceptTerms');

  const onSubmit = handleSubmit((values) => {
    const { firstName, lastName } = splitFullName(values.fullName);
    registerMutation.mutate(
      { firstName, lastName, email: values.email, password: values.password },
      {
        onSuccess: () => {
          router.replace('/dashboard');
          router.refresh();
        },
        onError: (error) => {
          const api = toApiError(error);
          toast.error(
            typeof api?.message === 'string'
              ? api.message
              : 'Registration failed',
          );
        },
      },
    );
  });

  const apiError = registerMutation.isError
    ? toApiError(registerMutation.error)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-xl font-semibold tracking-tight">
        Create Account
      </h1>

      <GoogleButton label="Sign Up with Google" />
      <AuthDivider label="or sign up with email" />

      {apiError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {typeof apiError.message === 'string'
            ? apiError.message
            : 'Registration failed'}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Regina Cooper"
            aria-invalid={!!errors.fullName}
            className={cn(errors.fullName && 'border-danger focus-visible:ring-danger')}
            {...register('fullName')}
          />
          {errors.fullName && (
            <p className="text-xs text-danger">{errors.fullName.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="cooper@example.com"
            aria-invalid={!!errors.email}
            className={cn(errors.email && 'border-danger focus-visible:ring-danger')}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-xs text-danger">{errors.email.message}</p>
          )}
        </div>

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

        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(v) => setValue('acceptTerms', v === true)}
            />
            I accept Terms and Conditions
          </label>
          {errors.acceptTerms && (
            <p className="text-xs text-danger">{errors.acceptTerms.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={registerMutation.isPending}
          className="mt-1 w-full"
        >
          {registerMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Create Account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Login
        </Link>
      </p>
    </div>
  );
}

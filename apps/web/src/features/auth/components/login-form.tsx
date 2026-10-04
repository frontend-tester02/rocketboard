'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  type LoginFormValues,
  type LoginInput,
} from '@rocket/shared';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { AuthDivider } from '@/features/auth/components/auth-divider';
import { GoogleButton } from '@/features/auth/components/google-button';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useLogin } from '@/features/auth/hooks';
import { toApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LoginFormValues, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const rememberMe = watch('rememberMe');

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => {
        router.replace(params.get('redirect') ?? '/dashboard');
        router.refresh();
      },
      onError: (error) => {
        const api = toApiError(error);
        toast.error(
          typeof api?.message === 'string' ? api.message : 'Login failed',
        );
      },
    });
  });

  const apiError = login.isError ? toApiError(login.error) : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-center text-xl font-semibold tracking-tight">
        Login To Your Account
      </h1>

      <GoogleButton label="Login with Google" />
      <AuthDivider label="or login with email" />

      {apiError && (
        <div className="rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {typeof apiError.message === 'string'
            ? apiError.message
            : 'Invalid email or password'}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className={cn(
              errors.password && 'border-danger focus-visible:ring-danger',
            )}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Checkbox
              checked={rememberMe}
              onCheckedChange={(v) => setValue('rememberMe', v === true)}
            />
            Remember Me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-medium text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <Button type="submit" disabled={login.isPending} className="mt-1 w-full">
          {login.isPending && <Loader2 className="size-4 animate-spin" />}
          Log In
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Sign Up
        </Link>
      </p>
    </div>
  );
}

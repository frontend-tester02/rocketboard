'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@rocket/shared';
import { Loader2, MailCheck } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { AuthLockIcon } from '@/features/auth/components/auth-lock-icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForgotPassword } from '@/features/auth/hooks';
import { cn } from '@/lib/utils';

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | undefined>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = handleSubmit((values) => {
    forgot.mutate(values.email, {
      onSuccess: (res) => {
        setSentTo(values.email);
        setDevLink(res.devLink);
      },
    });
  });

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-5 text-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-success/10">
          <MailCheck className="size-9 text-success" />
        </div>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;ve sent a password reset link to{' '}
            <span className="font-medium text-foreground">{sentTo}</span>.
          </p>
        </div>
        {devLink && (
          <a
            href={devLink}
            className="w-full rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-xs text-primary hover:underline"
          >
            Dev: open reset link
          </a>
        )}
        <Link href="/login" className="text-sm font-medium text-primary hover:underline">
          Go back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <AuthLockIcon />
      <h1 className="text-center text-xl font-semibold tracking-tight">
        Recover Your Password
      </h1>

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

        <Button type="submit" disabled={forgot.isPending} className="w-full">
          {forgot.isPending && <Loader2 className="size-4 animate-spin" />}
          Recover Password
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

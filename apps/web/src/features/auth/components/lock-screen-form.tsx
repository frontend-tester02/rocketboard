'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { unlockSchema, type UnlockInput } from '@rocket/shared';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { useLogout, useMe, useUnlock } from '@/features/auth/hooks';
import { toApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export function LockScreenForm() {
  const router = useRouter();
  const { data: user } = useMe();
  const unlock = useUnlock();
  const logout = useLogout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UnlockInput>({
    resolver: zodResolver(unlockSchema),
    defaultValues: { password: '' },
  });

  const name = user ? `${user.firstName} ${user.lastName}` : 'Welcome back';

  const onSubmit = handleSubmit((values) => {
    unlock.mutate(values.password, {
      onSuccess: () => {
        router.replace('/dashboard');
        router.refresh();
      },
      onError: (error) => {
        const api = toApiError(error);
        toast.error(
          typeof api?.message === 'string' ? api.message : 'Incorrect password',
        );
      },
    });
  });

  function handleSignInAsOther() {
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace('/login');
        router.refresh();
      },
    });
  }

  const apiError = unlock.isError ? toApiError(unlock.error) : null;

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <UserAvatar name={name} src={user?.avatar} className="size-20" />
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your password to access the admin.
        </p>
      </div>

      {apiError && (
        <div className="w-full rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {typeof apiError.message === 'string'
            ? apiError.message
            : 'Incorrect password'}
        </div>
      )}

      <form onSubmit={onSubmit} className="flex w-full flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1.5 text-left">
          <PasswordInput
            id="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={!!errors.password}
            className={cn(errors.password && 'border-danger focus-visible:ring-danger')}
            {...register('password')}
          />
          {errors.password && (
            <p className="text-xs text-danger">{errors.password.message}</p>
          )}
        </div>

        <Button type="submit" disabled={unlock.isPending} className="w-full">
          {unlock.isPending && <Loader2 className="size-4 animate-spin" />}
          Unlock
        </Button>
      </form>

      <p className="text-sm text-muted-foreground">
        Not you?{' '}
        <button
          type="button"
          onClick={handleSignInAsOther}
          className="font-medium text-primary hover:underline"
        >
          Sign In
        </button>
      </p>
    </div>
  );
}

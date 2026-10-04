import { Suspense } from 'react';
import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthShell, type AuthVariant } from '@/features/auth/components/auth-shell';
import { LoginForm } from '@/features/auth/components/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const variant: AuthVariant = v === '2' ? 'v2' : 'v1';

  return (
    <AuthShell variant={variant}>
      <AuthCard>
        <Suspense>
          <LoginForm />
        </Suspense>
      </AuthCard>
    </AuthShell>
  );
}

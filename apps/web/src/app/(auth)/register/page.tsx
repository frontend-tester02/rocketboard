import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthShell, type AuthVariant } from '@/features/auth/components/auth-shell';
import { RegisterForm } from '@/features/auth/components/register-form';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const variant: AuthVariant = v === '2' ? 'v2' : 'v1';

  return (
    <AuthShell variant={variant}>
      <AuthCard>
        <RegisterForm />
      </AuthCard>
    </AuthShell>
  );
}

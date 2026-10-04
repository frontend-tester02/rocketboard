import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthShell, type AuthVariant } from '@/features/auth/components/auth-shell';
import { ForgotPasswordForm } from '@/features/auth/components/forgot-password-form';

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;
  const variant: AuthVariant = v === '2' ? 'v2' : 'v1';

  return (
    <AuthShell variant={variant}>
      <AuthCard>
        <ForgotPasswordForm />
      </AuthCard>
    </AuthShell>
  );
}

import { AuthCard } from '@/features/auth/components/auth-card';
import { AuthShell, type AuthVariant } from '@/features/auth/components/auth-shell';
import { ResetPasswordForm } from '@/features/auth/components/reset-password-form';

export default async function ResetPasswordPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { token } = await params;
  const { v } = await searchParams;
  const variant: AuthVariant = v === '2' ? 'v2' : 'v1';

  return (
    <AuthShell variant={variant}>
      <AuthCard>
        <ResetPasswordForm token={token} />
      </AuthCard>
    </AuthShell>
  );
}

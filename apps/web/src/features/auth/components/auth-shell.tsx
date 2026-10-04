import type { ReactNode } from 'react';
import { AuthIllustration } from '@/features/auth/components/auth-illustration';

export type AuthVariant = 'v1' | 'v2';

/**
 * Auth page shell.
 *  - v1: blue panel with the illustration on the left, card on the right.
 *  - v2: plain light background, card centered (no illustration).
 */
export function AuthShell({
  variant = 'v1',
  children,
}: {
  variant?: AuthVariant;
  children: ReactNode;
}) {
  if (variant === 'v2') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
        {children}
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-primary p-4 sm:p-8">
      <div className="grid w-full max-w-5xl items-center gap-10 lg:grid-cols-2">
        <div className="hidden justify-center lg:flex">
          <AuthIllustration className="w-full max-w-md" />
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </main>
  );
}

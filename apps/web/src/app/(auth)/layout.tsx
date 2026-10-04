import type { ReactNode } from 'react';

// Each auth page renders its own AuthShell (v1/v2), so this is a passthrough.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

import { Suspense } from 'react';
import { MailPageClient } from '@/features/mail/components/mail-page-client';

export default function MailPage() {
  return (
    <Suspense fallback={null}>
      <MailPageClient />
    </Suspense>
  );
}

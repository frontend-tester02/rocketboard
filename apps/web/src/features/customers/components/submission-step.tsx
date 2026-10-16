'use client';

import { Pencil } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';
import { UserAvatar } from '@/components/common/user-avatar';
import type { CustomerFormValues } from '@/features/customers/customer-form-schema';

interface SubmissionStepProps {
  form: UseFormReturn<CustomerFormValues>;
  onEdit: (stepIndex: number) => void;
}

export function SubmissionStep({ form, onEdit }: SubmissionStepProps) {
  const v = form.watch();
  const name = `${v.firstName} ${v.lastName}`.trim();

  return (
    <div className="space-y-4">
      {/* Profile */}
      <Section title="Profile" onEdit={() => onEdit(0)}>
        <div className="flex items-center gap-3">
          <UserAvatar name={name || 'New'} src={v.avatar || undefined} className="size-12" />
          <div className="min-w-0">
            <p className="text-sm font-medium">{name || '—'}</p>
            <p className="truncate text-xs text-muted-foreground">{v.email || '—'}</p>
            {v.phone && <p className="text-xs text-muted-foreground">{v.phone}</p>}
          </div>
        </div>
      </Section>

      {/* Addresses */}
      <Section title={`Addresses (${v.addresses?.length ?? 0})`} onEdit={() => onEdit(1)}>
        {v.addresses && v.addresses.length > 0 ? (
          <ul className="space-y-2 text-sm">
            {v.addresses.map((a, i) => (
              <li key={i} className="text-muted-foreground">
                <span className="font-medium text-foreground">
                  {a.label || `Address ${i + 1}`}:
                </span>{' '}
                {[a.line1, a.city, a.state, a.country, a.zip].filter(Boolean).join(', ')}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No addresses added.</p>
        )}
      </Section>

      {/* Payment */}
      <Section
        title={`Payment methods (${v.paymentMethods?.length ?? 0})`}
        onEdit={() => onEdit(2)}
      >
        {v.paymentMethods && v.paymentMethods.length > 0 ? (
          <ul className="space-y-1 text-sm">
            {v.paymentMethods.map((p, i) => (
              <li key={i} className="text-muted-foreground">
                {p.brand} •••• {p.last4} · {String(p.expMonth).padStart(2, '0')}/{p.expYear}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No payment methods added.</p>
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          <Pencil className="size-3" />
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

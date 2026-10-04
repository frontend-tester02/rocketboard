'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Card } from '@/components/common/card';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { DataTable } from '@/components/common/data-table';
import { DateRangePicker } from '@/components/common/date-range-picker';
import { EmptyState } from '@/components/common/empty-state';
import { ExportMenu } from '@/components/common/export-menu';
import { PageHeader } from '@/components/common/page-header';
import { PeriodSelect } from '@/components/common/period-select';
import { SearchInput } from '@/components/common/search-input';
import { StatusBadge, type StatusVariant } from '@/components/common/status-badge';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';

interface Person {
  id: number;
  name: string;
  email: string;
  role: string;
  status: StatusVariant;
  amount: number;
}

const NAMES = [
  'Regina Cooper', 'Robert Edwards', 'Gloria Mckinney', 'Randall Fisher',
  'Devon Williamson', 'Debra Wilson', 'Judith Black', 'Philip Henry',
  'Mitchel Cooper', 'Jane Cooper', 'Cody Fisher', 'Esther Howard',
];
const STATUSES: StatusVariant[] = ['success', 'warning', 'danger', 'neutral'];
const ROLES = ['Admin', 'Manager', 'Member'];

const people: Person[] = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  name: NAMES[i % NAMES.length] ?? `User ${i + 1}`,
  email: `user${i + 1}@rocket.dev`,
  role: ROLES[i % ROLES.length] ?? 'Member',
  status: STATUSES[i % STATUSES.length] ?? 'neutral',
  amount: 500 + i * 137,
}));

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <UserAvatar name={row.original.name} className="size-8" />
        <span className="font-medium">{row.original.name}</span>
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.email}</span>
    ),
  },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'status',
    header: 'Status',
    enableSorting: false,
    cell: ({ row }) => (
      <StatusBadge variant={row.original.status}>{row.original.status}</StatusBadge>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-medium">{formatCurrency(row.original.amount)}</span>
    ),
  },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default function ComponentsDemoPage() {
  const [search, setSearch] = useState('');

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-10">
      <PageHeader
        title="Component Library"
        description="Shared components used across Rocket (S6)."
        actions={
          <>
            <ExportMenu onExport={(f) => toast.success(`Export: ${f}`)} />
            <Button>New</Button>
          </>
        }
      />

      <Section title="Status badges">
        <div className="flex flex-wrap gap-3">
          <StatusBadge variant="success">Active</StatusBadge>
          <StatusBadge variant="warning">Pending</StatusBadge>
          <StatusBadge variant="danger">Failed</StatusBadge>
          <StatusBadge variant="neutral">Draft</StatusBadge>
        </div>
      </Section>

      <Section title="Card">
        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="With menu" menu>
            <p className="text-sm text-muted-foreground">
              A surface with a titled header and the overflow menu.
            </p>
          </Card>
          <Card
            title="With action"
            action={<PeriodSelect />}
          >
            <p className="text-sm text-muted-foreground">
              Header action slot holding a control.
            </p>
          </Card>
        </div>
      </Section>

      <Section title="Pickers & inputs">
        <div className="flex flex-wrap items-center gap-3">
          <SearchInput value={search} onChange={setSearch} />
          <DateRangePicker />
          <PeriodSelect />
          <span className="text-sm text-muted-foreground">
            search (debounced): “{search}”
          </span>
        </div>
      </Section>

      <Section title="Avatars">
        <div className="flex items-center gap-3">
          {['Regina Cooper', 'Devon Williamson', 'Judith Black', 'Cody Fisher'].map(
            (n) => (
              <UserAvatar key={n} name={n} />
            ),
          )}
        </div>
      </Section>

      <Section title="Confirm dialog">
        <ConfirmDialog
          trigger={
            <Button variant="destructive">
              <Trash2 className="size-4" />
              Delete item
            </Button>
          }
          title="Delete this item?"
          description="This action cannot be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={() => toast.success('Deleted')}
        />
      </Section>

      <Section title="Data table">
        <DataTable columns={columns} data={people} enableSelection />
      </Section>

      <Section title="Empty state">
        <EmptyState
          title="No contacts yet"
          description="Add your first contact to get started."
          action={<Button size="sm">Add contact</Button>}
        />
      </Section>
    </main>
  );
}

import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <div className="flex items-center gap-3">
        <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Rocket className="size-6" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Rocket</h1>
          <p className="text-sm text-muted-foreground">Admin panel</p>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm">
        <p className="text-sm text-muted-foreground">
          Web foundation ready — Tailwind, shadcn/ui, TanStack Query, Toaster,
          axios client and design tokens are in place.
        </p>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">formatCurrency</dt>
            <dd className="font-medium">{formatCurrency(12599.5)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">formatDate</dt>
            <dd className="font-medium">{formatDate(new Date())}</dd>
          </div>
        </dl>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="destructive">Destructive</Button>
      </div>
    </main>
  );
}

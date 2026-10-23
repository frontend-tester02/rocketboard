'use client';

import type { PublicUser } from '@rocket/shared';
import {
  Briefcase,
  Mail,
  MapPin,
  Phone,
  Cake,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { StatusBadge } from '@/components/common/status-badge';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import { useMe } from '@/features/auth/hooks';
import { SettingsTab } from '@/features/profile/components/settings-tab';
import { useProjects } from '@/features/projects/hooks';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/utils';

type Tab = 'about' | 'activity' | 'projects' | 'settings';

const TABS: { value: Tab; label: string }[] = [
  { value: 'about', label: 'About' },
  { value: 'activity', label: 'Activity' },
  { value: 'projects', label: 'Projects' },
  { value: 'settings', label: 'Settings' },
];

export function ProfilePageClient() {
  const { data: user, isLoading } = useMe();
  const [tab, setTab] = useState<Tab>('about');

  if (isLoading || !user) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-24 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const name = `${user.firstName} ${user.lastName}`.trim();

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <div className="h-32 bg-gradient-to-r from-primary/80 to-accent/70" />
        <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <UserAvatar
              name={name}
              src={user.avatar}
              className="-mt-10 size-24 border-4 border-card shadow-sm"
            />
            <div className="pb-1">
              <h1 className="text-xl font-semibold">{name}</h1>
              <p className="text-sm text-muted-foreground">{user.jobTitle || 'No job title'}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setTab('settings')} className="sm:mb-1">
            Edit profile
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-t border-border px-5">
          {TABS.map((t) => {
            const active = tab === t.value;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTab(t.value)}
                className={cn(
                  '-mb-px border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                  active
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'about' && <AboutTab user={user} />}
      {tab === 'activity' && (
        <EmptyState title="No recent activity" description="Your activity timeline will appear here." />
      )}
      {tab === 'projects' && <ProjectsTab />}
      {tab === 'settings' && <SettingsTab user={user} />}
    </div>
  );
}

function AboutTab({ user }: { user: PublicUser }) {
  const rows: { icon: LucideIcon; label: string; value?: string }[] = [
    { icon: Mail, label: 'Email', value: user.email },
    { icon: Phone, label: 'Phone', value: user.phone },
    { icon: MapPin, label: 'Location', value: user.location },
    { icon: Briefcase, label: 'Job title', value: user.jobTitle },
    { icon: Cake, label: 'Birthday', value: user.birthday ? formatDate(user.birthday) : undefined },
    { icon: ShieldCheck, label: 'Role', value: user.role },
  ];

  return (
    <div className="rounded-xl border border-border/60 bg-card p-5">
      <h3 className="mb-4 text-sm font-semibold">About</h3>
      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <r.icon className="size-4" />
            </span>
            <div className="min-w-0">
              <dt className="text-xs text-muted-foreground">{r.label}</dt>
              <dd className="truncate text-sm font-medium capitalize">{r.value || '—'}</dd>
            </div>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ProjectsTab() {
  const { data: projects = [], isLoading } = useProjects({});

  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/60 bg-card px-4 py-12 text-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }
  if (projects.length === 0) {
    return <EmptyState title="No projects" description="Projects you own or belong to will appear here." />;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((p) => (
        <div key={p.id} className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium">{p.name}</p>
            <StatusBadge
              variant={p.status === 'done' ? 'success' : p.status === 'hold' ? 'warning' : 'neutral'}
            >
              {p.status}
            </StatusBadge>
          </div>
          {p.client && <p className="text-sm text-muted-foreground">{p.client}</p>}
          <div className="mt-auto">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{p.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

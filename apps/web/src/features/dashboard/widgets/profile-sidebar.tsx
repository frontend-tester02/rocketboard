'use client';

import { Pencil } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import { favorites, profileInfo } from '@/features/dashboard/mock';
import { useMe } from '@/features/auth/hooks';

export function ProfileSidebar() {
  const { data: user } = useMe();
  const name = user ? `${user.firstName} ${user.lastName}` : 'Felecia Brown';
  const role = user?.jobTitle ?? 'Product Manager';

  return (
    <div className="flex flex-col gap-5">
      {/* Identity */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <UserAvatar name={name} src={user?.avatar} className="size-20 text-xl" />
        <div>
          <p className="text-lg font-semibold">{name}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="size-3.5" />
          Edit profile
        </Button>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Info
        </h3>
        <dl className="flex flex-col gap-2.5 text-sm">
          {profileInfo.map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-4">
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="truncate font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Favorites */}
      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Favorites
        </h3>
        <div className="flex flex-col gap-3">
          {favorites.map((person) => (
            <div key={person.id} className="flex items-center gap-3">
              <UserAvatar name={person.name} className="size-9" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{person.name}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {person.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

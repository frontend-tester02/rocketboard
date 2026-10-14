'use client';

import { useState } from 'react';
import { UserAvatar } from '@/components/common/user-avatar';
import { Calendar } from '@/components/ui/calendar';
import { RecentActivity } from '@/features/dashboard/widgets/recent-activity';
import { useMe } from '@/features/auth/hooks';

function UserCard() {
  const { data: user } = useMe();
  const name = user ? `${user.firstName} ${user.lastName}` : 'Guest User';
  const role = user?.jobTitle ?? 'Team Member';

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5 text-center shadow-sm">
      <UserAvatar name={name} src={user?.avatar} className="size-16 text-lg" />
      <div>
        <p className="font-semibold">{name}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
      <div className="mt-1 grid w-full grid-cols-3 divide-x divide-border/60 border-t border-border/60 pt-3">
        <Stat label="Tasks" value="42" />
        <Stat label="Projects" value="8" />
        <Stat label="Done" value="196" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

export function RightPanel() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="flex flex-col gap-5">
      <UserCard />

      <div className="rounded-xl border border-border/60 bg-card p-2 shadow-sm">
        <Calendar mode="single" selected={date} onSelect={setDate} />
      </div>

      <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm">
        <h3 className="mb-4 text-base font-semibold">Recent Activity</h3>
        <RecentActivity />
      </div>
    </div>
  );
}

'use client';

import { Check, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { Card } from '@/components/common/card';
import { UserAvatar } from '@/components/common/user-avatar';
import { newFollowers } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

export function NewFollowersList() {
  const [followed, setFollowed] = useState<Record<string, boolean>>({});

  function toggle(id: string) {
    setFollowed((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <Card title="New Followers" menu bodyClassName="flex flex-col gap-3">
      {newFollowers.map((person) => {
        const isFollowing = followed[person.id] ?? false;
        return (
          <div key={person.id} className="flex items-center gap-3">
            <UserAvatar name={person.name} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{person.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {person.role}
              </p>
            </div>
            <button
              type="button"
              onClick={() => toggle(person.id)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                isFollowing
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90',
              )}
            >
              {isFollowing ? (
                <>
                  <Check className="size-3.5" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="size-3.5" />
                  Follow
                </>
              )}
            </button>
          </div>
        );
      })}
    </Card>
  );
}

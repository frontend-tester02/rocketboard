import { UserAvatar } from '@/components/common/user-avatar';
import { recentActivity } from '@/features/dashboard/mock';

export function RecentActivity() {
  return (
    <div className="flex flex-col gap-4">
      {recentActivity.map((group) => (
        <div key={group.date} className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {group.date}
          </p>
          <div className="flex flex-col gap-3">
            {group.items.map((item) => (
              <div key={item.id} className="flex items-start gap-3">
                <UserAvatar name={item.actor} className="size-8" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug">
                    <span className="font-medium">{item.actor}</span>{' '}
                    <span className="text-muted-foreground">{item.text}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

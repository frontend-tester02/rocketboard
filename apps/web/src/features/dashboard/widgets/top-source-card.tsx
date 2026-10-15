import { Card } from '@/components/common/card';
import type { TopSourceGroup } from '@/features/dashboard/mock';

export function TopSourceCard({ group }: { group: TopSourceGroup }) {
  return (
    <Card title={group.title} menu bodyClassName="flex flex-col gap-4">
      {group.rows.map((row) => (
        <div key={row.name} className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="truncate font-medium">{row.name}</span>
            <span className="shrink-0 text-muted-foreground">
              {row.sessions}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${row.pct}%` }}
            />
          </div>
        </div>
      ))}
    </Card>
  );
}

import { Card } from '@/components/common/card';
import { totalProjects } from '@/features/dashboard/mock';

export function TotalProjectsProgress() {
  return (
    <Card title="Total Projects" menu bodyClassName="flex flex-col gap-5">
      {totalProjects.map((item) => {
        const pct = Math.round((item.value / item.total) * 100);
        return (
          <div key={item.id} className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.label}</span>
              <span className="text-muted-foreground">
                {item.value}/{item.total}
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: item.color }}
              />
            </div>
          </div>
        );
      })}
    </Card>
  );
}

'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/card';
import { projectsStatus } from '@/features/dashboard/mock';

const rings = [
  { name: 'Ongoing', value: projectsStatus.ongoing, color: 'hsl(var(--primary))' },
  { name: 'On Hold', value: projectsStatus.hold, color: 'hsl(var(--warning))' },
  { name: 'Done', value: projectsStatus.done, color: 'hsl(var(--success))' },
];

const total = rings.reduce((sum, r) => sum + r.value, 0);

// Each ring is its own concentric donut: a filled arc over a muted track.
const radii = [
  { inner: 86, outer: 104 },
  { inner: 64, outer: 82 },
  { inner: 42, outer: 60 },
];

export function ProjectsDonut() {
  return (
    <Card title="Projects Overview" menu bodyClassName="flex flex-col items-center">
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            {rings.map((ring, i) => {
              const pct = (ring.value / total) * 100;
              const slice = [
                { name: ring.name, value: pct },
                { name: 'track', value: 100 - pct },
              ];
              return (
                <Pie
                  key={ring.name}
                  data={slice}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={radii[i]!.inner}
                  outerRadius={radii[i]!.outer}
                  startAngle={90}
                  endAngle={-270}
                  cornerRadius={8}
                  stroke="none"
                >
                  <Cell fill={ring.color} />
                  <Cell fill="hsl(var(--muted))" />
                </Pie>
              );
            })}
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs text-muted-foreground">Total</span>
        </div>
      </div>

      <div className="mt-2 flex w-full flex-col gap-2">
        {rings.map((ring) => (
          <div key={ring.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: ring.color }}
            />
            <span className="text-muted-foreground">{ring.name}</span>
            <span className="ml-auto font-medium">{ring.value}</span>
            <span className="w-12 text-right text-xs text-muted-foreground">
              {Math.round((ring.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

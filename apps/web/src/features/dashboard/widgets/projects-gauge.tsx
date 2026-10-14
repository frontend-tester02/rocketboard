'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/card';
import { projectsStatus } from '@/features/dashboard/mock';

const segments = [
  { name: 'Ongoing', value: projectsStatus.ongoing, color: 'hsl(var(--primary))' },
  { name: 'On Hold', value: projectsStatus.hold, color: 'hsl(var(--warning))' },
  { name: 'Done', value: projectsStatus.done, color: 'hsl(var(--success))' },
];

const total = segments.reduce((sum, s) => sum + s.value, 0);

export function ProjectsGauge() {
  return (
    <Card title="Projects" menu bodyClassName="flex flex-col items-center">
      <div className="relative h-[150px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="90%"
              innerRadius={82}
              outerRadius={110}
              startAngle={180}
              endAngle={0}
              paddingAngle={2}
              cornerRadius={6}
              stroke="none"
            >
              {segments.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-x-0 bottom-1 flex flex-col items-center">
          <span className="text-3xl font-semibold tracking-tight">{total}</span>
          <span className="text-xs text-muted-foreground">Total projects</span>
        </div>
      </div>

      <div className="mt-4 flex w-full items-center justify-around">
        {segments.map((s) => (
          <div key={s.name} className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span
                className="size-2.5 rounded-full"
                style={{ background: s.color }}
              />
              {s.name}
            </span>
            <span className="text-sm font-semibold">{s.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

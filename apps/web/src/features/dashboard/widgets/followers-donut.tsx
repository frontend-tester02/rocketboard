'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/card';
import { followerSources } from '@/features/dashboard/mock';

const total = followerSources.reduce((sum, s) => sum + s.value, 0);

export function FollowersDonut() {
  return (
    <Card title="Followers by Source" menu bodyClassName="flex flex-col items-center">
      <div className="relative h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={followerSources}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={84}
              paddingAngle={2}
              cornerRadius={6}
              stroke="none"
            >
              {followerSources.map((s) => (
                <Cell key={s.name} fill={s.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">{total}%</span>
          <span className="text-xs text-muted-foreground">Sources</span>
        </div>
      </div>

      <div className="mt-4 grid w-full grid-cols-2 gap-2">
        {followerSources.map((s) => (
          <div key={s.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-muted-foreground">{s.name}</span>
            <span className="ml-auto font-medium">{s.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

'use client';

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/common/card';
import { onlineUsers } from '@/features/dashboard/mock';

const total = onlineUsers.reduce((sum, u) => sum + u.value, 0);

export function OnlineUsersDonut() {
  return (
    <Card title="Online Users" menu bodyClassName="flex flex-col items-center">
      <div className="relative h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={onlineUsers}
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
              {onlineUsers.map((u) => (
                <Cell key={u.name} fill={u.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tracking-tight">{total}%</span>
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
      </div>

      <div className="mt-4 flex w-full flex-col gap-2">
        {onlineUsers.map((u) => (
          <div key={u.name} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 rounded-full"
              style={{ background: u.color }}
            />
            <span className="text-muted-foreground">{u.name}</span>
            <span className="ml-auto font-medium">{u.value}%</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

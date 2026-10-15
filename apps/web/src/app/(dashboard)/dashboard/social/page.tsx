'use client';

import { Settings, Users } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { PageHeader } from '@/components/common/page-header';
import { socialStats } from '@/features/dashboard/mock';
import { FollowersDonut } from '@/features/dashboard/widgets/followers-donut';
import { FollowersGrowthBars } from '@/features/dashboard/widgets/followers-growth-bars';
import { NewFollowersList } from '@/features/dashboard/widgets/new-followers-list';
import { ProfileSidebar } from '@/features/dashboard/widgets/profile-sidebar';
import { SocialStatCard } from '@/features/dashboard/widgets/social-stat-card';
import { VisitsAreaChart } from '@/features/dashboard/widgets/visits-area-chart';
import { cn } from '@/lib/utils';

const tabs = ['Activity', 'Settings', 'Users'] as const;
type Tab = (typeof tabs)[number];

export default function SocialDashboardPage() {
  const [tab, setTab] = useState<Tab>('Activity');

  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      {/* Left profile column */}
      <aside className="w-full shrink-0 xl:w-72">
        <ProfileSidebar />
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <PageHeader title="Social" />

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                '-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
                tab === t
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 'Activity' && (
          <div className="flex flex-col gap-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {socialStats.map((stat) => (
                <SocialStatCard key={stat.key} stat={stat} />
              ))}
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <VisitsAreaChart />
              </div>
              <div className="lg:col-span-1">
                <FollowersDonut />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              <FollowersGrowthBars />
              <NewFollowersList />
            </div>
          </div>
        )}

        {tab === 'Settings' && (
          <EmptyState
            icon={Settings}
            title="Settings"
            description="Profile and account settings arrive in prompts 95–96."
          />
        )}

        {tab === 'Users' && (
          <EmptyState
            icon={Users}
            title="Users"
            description="Team member management arrives in a later stage."
          />
        )}
      </div>
    </div>
  );
}

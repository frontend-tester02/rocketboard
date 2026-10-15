import { PageHeader } from '@/components/common/page-header';
import { PeriodSelect } from '@/components/common/period-select';
import { stats, topSources } from '@/features/dashboard/mock';
import { AnalyticsLineChart } from '@/features/dashboard/widgets/analytics-line-chart';
import { OnlineUsersDonut } from '@/features/dashboard/widgets/online-users-donut';
import { StatCard } from '@/features/dashboard/widgets/stat-card';
import { StatisticsBarChart } from '@/features/dashboard/widgets/statistics-bar-chart';
import { TopSourceCard } from '@/features/dashboard/widgets/top-source-card';

export default function AnalyticsDashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Analytics" actions={<PeriodSelect />} />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatisticsBarChart stacked />
        </div>
        <div className="lg:col-span-1">
          <OnlineUsersDonut />
        </div>
      </div>

      <AnalyticsLineChart />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {topSources.map((group) => (
          <TopSourceCard key={group.key} group={group} />
        ))}
      </div>
    </div>
  );
}

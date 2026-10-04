import { Download } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { SelectChip } from '@/components/common/select-chip';
import { stats } from '@/features/dashboard/mock';
import { AnalyticsLineChart } from '@/features/dashboard/widgets/analytics-line-chart';
import { DivergingBarChart } from '@/features/dashboard/widgets/diverging-bar-chart';
import { LastOrdersTable } from '@/features/dashboard/widgets/last-orders-table';
import { SalesGauge } from '@/features/dashboard/widgets/sales-gauge';
import { StatCard } from '@/features/dashboard/widgets/stat-card';
import { StatisticsBarChart } from '@/features/dashboard/widgets/statistics-bar-chart';
import { TransactionsList } from '@/features/dashboard/widgets/transactions-list';

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Overview"
        actions={
          <>
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-lg border border-border/60 bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Export"
            >
              <Download className="size-4" />
            </button>
            <SelectChip label="Last 7 days" />
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.key} stat={stat} />
        ))}
      </div>

      {/* Statistics + Analytics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <StatisticsBarChart />
        <AnalyticsLineChart />
      </div>

      {/* Sales gauge + diverging statistics */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <SalesGauge />
        </div>
        <div className="lg:col-span-2">
          <DivergingBarChart />
        </div>
      </div>

      {/* Last orders + transactions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LastOrdersTable />
        </div>
        <div className="lg:col-span-1">
          <TransactionsList />
        </div>
      </div>
    </div>
  );
}

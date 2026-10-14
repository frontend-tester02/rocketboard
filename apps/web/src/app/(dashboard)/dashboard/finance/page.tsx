import { Download } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { SelectChip } from '@/components/common/select-chip';
import { sparkStats } from '@/features/dashboard/mock';
import { BalanceCard } from '@/features/dashboard/widgets/balance-card';
import { CategoryTransactionsList } from '@/features/dashboard/widgets/category-transactions-list';
import { MyCardsWidget } from '@/features/dashboard/widgets/my-cards-widget';
import { StatCardSparkline } from '@/features/dashboard/widgets/stat-card-sparkline';
import { StatisticsBarChart } from '@/features/dashboard/widgets/statistics-bar-chart';

export default function FinanceDashboardPage() {
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

      {/* Sparkline stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sparkStats.map((stat) => (
          <StatCardSparkline key={stat.key} stat={stat} />
        ))}
      </div>

      {/* Statistics + Balance */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <StatisticsBarChart />
        </div>
        <div className="lg:col-span-1">
          <BalanceCard />
        </div>
      </div>

      {/* My Cards + category transactions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MyCardsWidget />
        </div>
        <div className="lg:col-span-1">
          <CategoryTransactionsList />
        </div>
      </div>
    </div>
  );
}

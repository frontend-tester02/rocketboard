import { PageHeader } from '@/components/common/page-header';
import { PeriodSelect } from '@/components/common/period-select';
import { BalanceLineChart } from '@/features/dashboard/widgets/balance-line-chart';
import { CardsCarousel } from '@/features/dashboard/widgets/cards-carousel';
import { IncomeSpentCards } from '@/features/dashboard/widgets/income-spent-cards';
import { PaymentsList } from '@/features/dashboard/widgets/payments-list';
import { TransactionsList } from '@/features/dashboard/widgets/transactions-list';
import { WalletContactsList } from '@/features/dashboard/widgets/wallet-contacts-list';

export default function WalletDashboardPage() {
  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <PageHeader title="Wallet" actions={<PeriodSelect />} />

        <IncomeSpentCards />

        <BalanceLineChart />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <TransactionsList />
          <PaymentsList />
        </div>
      </div>

      {/* Right panel */}
      <aside className="flex w-full shrink-0 flex-col gap-5 xl:w-80">
        <CardsCarousel />
        <WalletContactsList />
      </aside>
    </div>
  );
}

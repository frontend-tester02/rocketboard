import { PageHeader } from '@/components/common/page-header';
import { PeriodSelect } from '@/components/common/period-select';
import { miniBarStats } from '@/features/dashboard/mock';
import { ActiveTasksList } from '@/features/dashboard/widgets/active-tasks-list';
import { MiniBarStat } from '@/features/dashboard/widgets/mini-bar-stat';
import { PostingTasksHeatmap } from '@/features/dashboard/widgets/posting-tasks-heatmap';
import { ProjectsDonut } from '@/features/dashboard/widgets/projects-donut';
import { RightPanel } from '@/features/dashboard/widgets/right-panel';
import { TotalProjectsProgress } from '@/features/dashboard/widgets/total-projects-progress';

export default function TasksDashboardPage() {
  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <PageHeader title="Tasks" actions={<PeriodSelect />} />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {miniBarStats.map((stat) => (
            <MiniBarStat key={stat.key} stat={stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProjectsDonut />
          <TotalProjectsProgress />
        </div>

        <ActiveTasksList />

        <PostingTasksHeatmap />
      </div>

      {/* Right panel */}
      <aside className="w-full shrink-0 xl:w-80">
        <RightPanel />
      </aside>
    </div>
  );
}

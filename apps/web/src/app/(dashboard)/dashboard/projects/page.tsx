import { PageHeader } from '@/components/common/page-header';
import { PeriodSelect } from '@/components/common/period-select';
import { taskTiles } from '@/features/dashboard/mock';
import { ActiveTasksList } from '@/features/dashboard/widgets/active-tasks-list';
import { PostingTasksHeatmap } from '@/features/dashboard/widgets/posting-tasks-heatmap';
import { ProjectsGauge } from '@/features/dashboard/widgets/projects-gauge';
import { RightPanel } from '@/features/dashboard/widgets/right-panel';
import { TaskTile } from '@/features/dashboard/widgets/task-tile';

export default function ProjectsDashboardPage() {
  return (
    <div className="flex flex-col gap-5 xl:flex-row">
      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <PageHeader title="Projects" actions={<PeriodSelect />} />

        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {taskTiles.map((tile) => (
            <TaskTile key={tile.key} tile={tile} />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ProjectsGauge />
          <ActiveTasksList />
        </div>

        <PostingTasksHeatmap />
      </div>

      {/* Right panel */}
      <aside className="w-full shrink-0 xl:w-80">
        <RightPanel />
      </aside>
    </div>
  );
}

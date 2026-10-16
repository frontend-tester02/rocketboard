import { PageHeader } from '@/components/common/page-header';
import { CalendarView } from '@/features/calendar/components/calendar-view';

export default function CalendarPage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader title="Calendar" />
      <CalendarView />
    </div>
  );
}

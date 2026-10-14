'use client';

import { Card } from '@/components/common/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { heatmap, heatmapDays, heatmapHours } from '@/features/dashboard/mock';
import { cn } from '@/lib/utils';

// Posting intensity 0–4 mapped to brand-blue tints.
const levelClass = [
  'bg-muted',
  'bg-primary/20',
  'bg-primary/40',
  'bg-primary/70',
  'bg-primary',
];

export function PostingTasksHeatmap() {
  return (
    <Card title="Posting Tasks" menu>
      <TooltipProvider delayDuration={100}>
        <div className="flex gap-3 overflow-x-auto">
          {/* Day labels */}
          <div className="flex flex-col gap-1.5 pt-6">
            {heatmapDays.map((day) => (
              <span
                key={day}
                className="flex h-8 items-center text-xs text-muted-foreground"
              >
                {day}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            {/* Hour labels */}
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${heatmapHours.length}, minmax(0, 1fr))` }}
            >
              {heatmapHours.map((hour) => (
                <span
                  key={hour}
                  className="pb-1 text-center text-xs text-muted-foreground"
                >
                  {hour}
                </span>
              ))}
            </div>

            {/* Grid */}
            <div className="flex flex-col gap-1.5">
              {heatmap.map((row, dayIdx) => (
                <div
                  key={heatmapDays[dayIdx]}
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${heatmapHours.length}, minmax(0, 1fr))` }}
                >
                  {row.map((level, hourIdx) => (
                    <Tooltip key={hourIdx}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          className={cn(
                            'h-8 min-w-6 rounded-md transition-transform hover:scale-105',
                            levelClass[level],
                          )}
                          aria-label={`${heatmapDays[dayIdx]} ${heatmapHours[hourIdx]}:00 — ${level * 3} tasks`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {heatmapDays[dayIdx]} {heatmapHours[hourIdx]}:00 ·{' '}
                        {level * 3} tasks
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </TooltipProvider>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
        <span>Less</span>
        {levelClass.map((c, i) => (
          <span key={i} className={cn('size-3 rounded-sm', c)} />
        ))}
        <span>More</span>
      </div>
    </Card>
  );
}

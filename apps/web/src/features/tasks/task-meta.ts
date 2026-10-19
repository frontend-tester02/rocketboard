import { TaskPriority } from '@rocket/shared';

export const priorityMeta: Record<TaskPriority, { label: string; className: string; bar: string }> = {
  [TaskPriority.Low]: { label: 'Low', className: 'bg-muted text-muted-foreground', bar: 'bg-muted-foreground/40' },
  [TaskPriority.Medium]: { label: 'Medium', className: 'bg-primary/10 text-primary', bar: 'bg-primary' },
  [TaskPriority.High]: { label: 'High', className: 'bg-warning/15 text-warning', bar: 'bg-warning' },
  [TaskPriority.Urgent]: { label: 'Urgent', className: 'bg-danger/10 text-danger', bar: 'bg-danger' },
};

/** Deterministic soft color per label name. */
const labelColors = [
  'bg-primary/10 text-primary',
  'bg-warning/15 text-warning',
  'bg-success/10 text-success',
  'bg-danger/10 text-danger',
  'bg-purple-500/10 text-purple-600 dark:text-purple-400',
];
export function labelColor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return labelColors[sum % labelColors.length]!;
}

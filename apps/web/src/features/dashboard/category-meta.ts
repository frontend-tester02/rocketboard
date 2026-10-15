import {
  Dumbbell,
  Pill,
  Plane,
  ShoppingBag,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';
import type { TxCategory } from '@/features/dashboard/mock';

/** Shared icon + color per transaction category (transactions & payments lists). */
export const categoryMeta: Record<
  TxCategory,
  { icon: LucideIcon; className: string }
> = {
  shopping: { icon: ShoppingBag, className: 'bg-primary/10 text-primary' },
  travel: { icon: Plane, className: 'bg-warning/15 text-warning' },
  food: { icon: UtensilsCrossed, className: 'bg-success/10 text-success' },
  medicine: { icon: Pill, className: 'bg-danger/10 text-danger' },
  sport: { icon: Dumbbell, className: 'bg-muted text-muted-foreground' },
};

export interface NoteColor {
  id: string;
  label: string;
  /** Card background + border classes. */
  cardClass: string;
  /** Swatch dot for the color picker. */
  dotClass: string;
}

export const NOTE_COLORS: NoteColor[] = [
  { id: 'default', label: 'Default', cardClass: 'bg-card border-border/60', dotClass: 'bg-muted-foreground/40' },
  { id: 'yellow', label: 'Yellow', cardClass: 'bg-warning/10 border-warning/25', dotClass: 'bg-warning' },
  { id: 'green', label: 'Green', cardClass: 'bg-success/10 border-success/25', dotClass: 'bg-success' },
  { id: 'blue', label: 'Blue', cardClass: 'bg-primary/10 border-primary/25', dotClass: 'bg-primary' },
  { id: 'red', label: 'Red', cardClass: 'bg-danger/10 border-danger/25', dotClass: 'bg-danger' },
];

export function noteColor(id?: string): NoteColor {
  return NOTE_COLORS.find((c) => c.id === id) ?? NOTE_COLORS[0]!;
}

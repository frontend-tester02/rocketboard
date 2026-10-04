'use client';

import {
  Download,
  FileSpreadsheet,
  FileText,
  Printer,
  Table as TableIcon,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export type ExportFormat = 'print' | 'excel' | 'pdf' | 'csv';

const options: { format: ExportFormat; label: string; icon: typeof Printer }[] = [
  { format: 'print', label: 'Print', icon: Printer },
  { format: 'excel', label: 'Excel', icon: FileSpreadsheet },
  { format: 'pdf', label: 'PDF', icon: FileText },
  { format: 'csv', label: 'CSV', icon: TableIcon },
];

export function ExportMenu({
  onExport,
  className,
}: {
  onExport?: (format: ExportFormat) => void;
  className?: string;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          'inline-flex h-9 items-center gap-2 rounded-lg border border-border/60 bg-background px-3 text-sm font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring',
          className,
        )}
      >
        <Download className="size-4" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {options.map(({ format, label, icon: Icon }) => (
          <DropdownMenuItem key={format} onSelect={() => onExport?.(format)}>
            <Icon />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

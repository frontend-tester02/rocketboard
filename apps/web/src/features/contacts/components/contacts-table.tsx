'use client';

import type { ContactDto } from '@rocket/shared';
import { type ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import { DataTable } from '@/components/common/data-table';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ContactsTableProps {
  data: ContactDto[];
  onEdit: (contact: ContactDto) => void;
  onDelete: (contact: ContactDto) => void;
  onToggleFavorite: (contact: ContactDto) => void;
}

function fullName(c: ContactDto): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function ContactsTable({ data, onEdit, onDelete, onToggleFavorite }: ContactsTableProps) {
  const columns = useMemo<ColumnDef<ContactDto>[]>(
    () => [
      {
        accessorKey: 'firstName',
        header: 'Name',
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex items-center gap-3">
              <UserAvatar name={fullName(c) || '?'} src={c.avatar} />
              <div className="flex items-center gap-1.5 font-medium">
                {fullName(c) || '—'}
                {c.isFavorite && <Star className="size-3.5 text-warning" fill="currentColor" />}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'jobTitle',
        header: 'Job Title',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.jobTitle || '—'}</span>,
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.email || '—'}</span>,
      },
      {
        accessorKey: 'phone',
        header: 'Phone',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.phone || '—'}</span>,
      },
      {
        accessorKey: 'company',
        header: 'Company',
        cell: ({ row }) => <span className="text-muted-foreground">{row.original.company || '—'}</span>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  aria-label="Row actions"
                >
                  <MoreHorizontal className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onSelect={() => onToggleFavorite(c)}>
                    <Star className={cn('size-4', c.isFavorite && 'text-warning')} />
                    {c.isFavorite ? 'Remove favorite' : 'Add favorite'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => onEdit(c)}>
                    <Pencil className="size-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-danger focus:text-danger" onSelect={() => onDelete(c)}>
                    <Trash2 className="size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [onEdit, onDelete, onToggleFavorite],
  );

  return <DataTable columns={columns} data={data} enableSelection emptyMessage="No contacts found." />;
}

'use client';

import type { ContactDto } from '@rocket/shared';
import { Mail, MoreVertical, Pencil, Phone, Star, Trash2 } from 'lucide-react';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

function fullName(c: ContactDto): string {
  return `${c.firstName} ${c.lastName}`.trim();
}

export function ContactCard({
  contact,
  onEdit,
  onDelete,
  onToggleFavorite,
}: {
  contact: ContactDto;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
}) {
  const name = fullName(contact) || '—';

  return (
    <div className="group relative flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card p-5 text-center shadow-sm transition-colors hover:border-primary/40">
      <div className="absolute right-2 top-2 flex items-center gap-0.5">
        <button
          type="button"
          onClick={onToggleFavorite}
          aria-label={contact.isFavorite ? 'Remove favorite' : 'Add favorite'}
          className={cn(
            'inline-flex size-7 items-center justify-center rounded-md transition-colors hover:bg-accent',
            contact.isFavorite ? 'text-warning' : 'text-muted-foreground opacity-0 group-hover:opacity-100',
          )}
        >
          <Star className="size-4" fill={contact.isFavorite ? 'currentColor' : 'none'} />
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground opacity-0 outline-none transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100"
            aria-label="Contact actions"
          >
            <MoreVertical className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-danger focus:text-danger" onSelect={onDelete}>
              <Trash2 className="size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <UserAvatar name={name} src={contact.avatar} className="size-16" />
      <div className="min-w-0">
        <p className="truncate font-semibold">{name}</p>
        <p className="truncate text-sm text-muted-foreground">{contact.jobTitle || contact.company || '—'}</p>
      </div>

      <div className="flex items-center gap-1.5">
        <IconLink href={contact.email ? `mailto:${contact.email}` : undefined} label="Email">
          <Mail className="size-4" />
        </IconLink>
        <IconLink href={contact.phone ? `tel:${contact.phone}` : undefined} label="Call">
          <Phone className="size-4" />
        </IconLink>
      </div>
    </div>
  );
}

function IconLink({
  href,
  label,
  children,
}: {
  href?: string;
  label: string;
  children: React.ReactNode;
}) {
  const cls =
    'inline-flex size-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground';
  if (!href) return <span className={cn(cls, 'pointer-events-none opacity-40')}>{children}</span>;
  return (
    <a href={href} aria-label={label} className={cls}>
      {children}
    </a>
  );
}

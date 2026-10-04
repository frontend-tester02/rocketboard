import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Deterministic soft background per name, so avatars look varied without images.
const palette = [
  'bg-primary/10 text-primary',
  'bg-warning/15 text-warning',
  'bg-success/10 text-success',
  'bg-danger/10 text-danger',
  'bg-muted text-muted-foreground',
];

function colorFor(name: string): string {
  let sum = 0;
  for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
  return palette[sum % palette.length] ?? (palette[0] as string);
}

export function UserAvatar({
  name,
  src,
  className,
}: {
  name: string;
  src?: string;
  className?: string;
}) {
  return (
    <Avatar className={cn('size-9', className)}>
      {src && <AvatarImage src={src} alt={name} />}
      <AvatarFallback className={cn('text-xs font-semibold', colorFor(name))}>
        {initials(name)}
      </AvatarFallback>
    </Avatar>
  );
}

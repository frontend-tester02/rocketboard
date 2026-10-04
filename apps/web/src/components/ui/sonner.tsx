'use client';

import { Toaster as SonnerToaster } from 'sonner';

type ToasterProps = React.ComponentProps<typeof SonnerToaster>;

/**
 * App toaster. Styled via Tailwind tokens so toasts match light/dark themes.
 * Trigger with `import { toast } from 'sonner'`.
 */
export function Toaster(props: ToasterProps) {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'group rounded-lg border border-border bg-card text-card-foreground shadow-lg',
          description: 'text-muted-foreground',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}

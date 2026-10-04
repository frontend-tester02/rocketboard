import { Lock } from 'lucide-react';

/** Amber padlock badge used on the recover/reset screens. */
export function AuthLockIcon() {
  return (
    <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-warning/15">
      <Lock className="size-9 text-warning" strokeWidth={2.2} />
    </div>
  );
}

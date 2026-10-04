'use client';

import { ChevronDown, Lock, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/common/user-avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLock, useLogout, useMe } from '@/features/auth/hooks';

export function UserMenu() {
  const router = useRouter();
  const { data: user } = useMe();
  const lock = useLock();
  const logout = useLogout();

  const name = user ? `${user.firstName} ${user.lastName}` : 'Account';
  const email = user?.email ?? '';

  function handleLock() {
    lock.mutate(undefined, {
      onSuccess: () => {
        router.replace('/lock-screen');
        router.refresh();
      },
    });
  }

  function handleLogout() {
    logout.mutate(undefined, {
      onSettled: () => {
        router.replace('/login');
        router.refresh();
      },
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-full p-1 pr-2 outline-none transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <UserAvatar name={name} src={user?.avatar} className="size-8" />
        <span className="hidden text-sm font-medium sm:inline">{name}</span>
        <ChevronDown className="hidden size-4 text-muted-foreground sm:inline" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold">{name}</span>
          {email && (
            <span className="text-xs font-normal text-muted-foreground">
              {email}
            </span>
          )}
        </DropdownMenuLabel>
        {/* My Profile / Settings arrive in prompt 06. */}
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLock}>
          <Lock />
          Lock Screen
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={handleLogout}
          className="text-danger focus:text-danger"
        >
          <LogOut />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

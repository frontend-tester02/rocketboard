'use client';

import { MailFolder } from '@rocket/shared';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import type { MailsQuery } from '@/features/mail/api';

export interface MailUrlState {
  folder: MailFolder;
  label?: string;
  search: string;
  page: number;
  selected?: string;
}

export function useMailUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const state = useMemo<MailUrlState>(
    () => ({
      folder: (searchParams.get('folder') as MailFolder) || MailFolder.Inbox,
      label: searchParams.get('label') ?? undefined,
      search: searchParams.get('search') ?? '',
      page: Number(searchParams.get('page')) || 1,
      selected: searchParams.get('mail') ?? undefined,
    }),
    [searchParams],
  );

  const setParams = useCallback(
    (updates: Record<string, string | number | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === undefined || value === '' || value === null) next.delete(key);
        else next.set(key, String(value));
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const query = useMemo<MailsQuery>(
    () => ({
      folder: state.folder,
      label: state.label,
      search: state.search || undefined,
      page: state.page,
      limit: 20,
    }),
    [state],
  );

  return { state, setParams, query };
}

'use client';

import type { ConversationDto } from '@rocket/shared';
import { Check, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SearchInput } from '@/components/common/search-input';
import { UserAvatar } from '@/components/common/user-avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAddMembers, useUserSearch } from '@/features/chat/hooks';
import { cn } from '@/lib/utils';

interface InviteMembersModalProps {
  conversation: ConversationDto;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteMembersModal({
  conversation,
  open,
  onOpenChange,
}: InviteMembersModalProps) {
  const [term, setTerm] = useState('');
  const [picked, setPicked] = useState<Record<string, boolean>>({});
  const usersQuery = useUserSearch(term);
  const addMembers = useAddMembers();

  const memberIds = useMemo(
    () => new Set(conversation.members.map((m) => m.id)),
    [conversation.members],
  );
  const candidates = (usersQuery.data ?? []).filter((u) => !memberIds.has(u.id));
  const pickedCount = Object.values(picked).filter(Boolean).length;

  function invite() {
    const members = Object.entries(picked).filter(([, v]) => v).map(([k]) => k);
    if (members.length === 0) return;
    addMembers.mutate(
      { id: conversation.id, members },
      {
        onSuccess: () => {
          setPicked({});
          setTerm('');
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setPicked({});
          setTerm('');
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Invite members</DialogTitle>
        </DialogHeader>

        <SearchInput value={term} onChange={setTerm} placeholder="Search people…" className="w-full" />

        <div className="max-h-64 overflow-y-auto">
          {candidates.length ? (
            candidates.map((u) => {
              const name = `${u.firstName} ${u.lastName}`;
              const isPicked = picked[u.id] ?? false;
              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setPicked((p) => ({ ...p, [u.id]: !p[u.id] }))}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent',
                    isPicked && 'bg-primary/5',
                  )}
                >
                  <UserAvatar name={name} src={u.avatar} className="size-8" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded border',
                      isPicked ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                    )}
                  >
                    {isPicked && <Check className="size-3" />}
                  </span>
                </button>
              );
            })
          ) : (
            <p className="px-2 py-6 text-center text-sm text-muted-foreground">
              No people to add.
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={invite} disabled={pickedCount === 0 || addMembers.isPending} className="gap-1.5">
            {addMembers.isPending && <Loader2 className="size-4 animate-spin" />}
            Invite{pickedCount > 0 ? ` (${pickedCount})` : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

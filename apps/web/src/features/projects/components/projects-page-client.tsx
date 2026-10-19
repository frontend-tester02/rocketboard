'use client';

import { ProjectStatus, type ProjectDto } from '@rocket/shared';
import { LayoutGrid, List, Search } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { ConfirmDialog } from '@/components/common/confirm-dialog';
import { PageHeader } from '@/components/common/page-header';
import { SearchInput } from '@/components/common/search-input';
import { AddProjectModal } from '@/features/projects/components/add-project-modal';
import { ProjectCard } from '@/features/projects/components/project-card';
import { ProjectsList } from '@/features/projects/components/projects-list';
import { useDeleteProject, useProjectCounts, useProjects } from '@/features/projects/hooks';
import type { ProjectsQuery } from '@/features/projects/api';
import { cn } from '@/lib/utils';

const tabs = [
  { value: 'all', label: 'All', key: 'all' as const },
  { value: ProjectStatus.Ongoing, label: 'Ongoing', key: 'ongoing' as const },
  { value: ProjectStatus.Hold, label: 'On Hold', key: 'hold' as const },
  { value: ProjectStatus.Done, label: 'Done', key: 'done' as const },
];

export function ProjectsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = searchParams.get('status') ?? 'all';
  const view = searchParams.get('view') ?? 'grid';
  const search = searchParams.get('search') ?? '';

  const setParams = useCallback(
    (updates: Record<string, string | undefined>) => {
      const next = new URLSearchParams(searchParams.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v) next.delete(k);
        else next.set(k, v);
      }
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const query = useMemo<ProjectsQuery>(
    () => ({
      status: tab === 'all' ? undefined : (tab as ProjectStatus),
      search: search || undefined,
    }),
    [tab, search],
  );

  const projectsQuery = useProjects(query);
  const countsQuery = useProjectCounts();
  const deleteProject = useDeleteProject();

  const [editing, setEditing] = useState<ProjectDto | null>(null);
  const [toDelete, setToDelete] = useState<ProjectDto | null>(null);

  const projects = projectsQuery.data ?? [];

  const onOpen = useCallback(
    (p: ProjectDto) => router.push(`/projects/${p.id}`),
    [router],
  );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Projects"
        actions={
          <>
            <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-background p-0.5">
              <button
                type="button"
                onClick={() => setParams({ view: undefined })}
                className={cn('inline-flex size-8 items-center justify-center rounded-md transition-colors', view === 'grid' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}
                aria-label="Grid view"
              >
                <LayoutGrid className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => setParams({ view: 'list' })}
                className={cn('inline-flex size-8 items-center justify-center rounded-md transition-colors', view === 'list' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground')}
                aria-label="List view"
              >
                <List className="size-4" />
              </button>
            </div>
            <AddProjectModal />
          </>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b border-border">
        {tabs.map((t) => {
          const count = countsQuery.data?.[t.key];
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => setParams({ status: t.value === 'all' ? undefined : t.value })}
              className={cn('-mb-px flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors', active ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground')}
            >
              {t.label}
              {count != null && (
                <span className={cn('rounded-full px-1.5 py-0.5 text-xs', active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2">
        <Search className="size-4 text-muted-foreground" />
        <SearchInput value={search} onChange={(v) => setParams({ search: v || undefined })} placeholder="Search projects…" className="w-full max-w-xs" />
      </div>

      {/* Content */}
      {projectsQuery.isLoading ? (
        <div className="rounded-xl border border-border/60 bg-card px-4 py-16 text-center text-sm text-muted-foreground">Loading…</div>
      ) : projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card px-4 py-16 text-center text-sm text-muted-foreground">No projects yet.</div>
      ) : view === 'list' ? (
        <ProjectsList projects={projects} onOpen={onOpen} onEdit={setEditing} onDelete={setToDelete} />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onOpen={() => onOpen(p)} onEdit={() => setEditing(p)} onDelete={() => setToDelete(p)} />
          ))}
        </div>
      )}

      <AddProjectModal project={editing} open={editing !== null} onOpenChange={(o) => !o && setEditing(null)} />

      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete project?"
        description={toDelete ? `“${toDelete.name}” and its board will be permanently removed.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (toDelete) deleteProject.mutate(toDelete.id, { onSettled: () => setToDelete(null) });
        }}
      />
    </div>
  );
}

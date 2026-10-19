'use client';

import type { UpdateProject } from '@rocket/shared';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  createProject,
  deleteProject,
  getProject,
  getProjectCounts,
  getProjectTasks,
  listProjects,
  updateProject,
  type ProjectsQuery,
} from '@/features/projects/api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (q: ProjectsQuery) => ['projects', 'list', q] as const,
  counts: () => ['projects', 'counts'] as const,
  detail: (id: string) => ['projects', 'detail', id] as const,
  tasks: (id: string) => ['projects', 'tasks', id] as const,
};

export function useProjects(query: ProjectsQuery) {
  return useQuery({
    queryKey: projectKeys.list(query),
    queryFn: () => listProjects(query),
    placeholderData: keepPreviousData,
  });
}
export function useProjectCounts() {
  return useQuery({ queryKey: projectKeys.counts(), queryFn: getProjectCounts });
}
export function useProject(id: string | null) {
  return useQuery({
    queryKey: projectKeys.detail(id ?? ''),
    queryFn: () => getProject(id!),
    enabled: !!id,
  });
}
export function useProjectTasks(id: string | null) {
  return useQuery({
    queryKey: projectKeys.tasks(id ?? ''),
    queryFn: () => getProjectTasks(id!),
    enabled: !!id,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => void qc.invalidateQueries({ queryKey: projectKeys.all });
}

export function useCreateProject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      invalidate();
      toast.success('Project created');
    },
  });
}
export function useUpdateProject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProject }) => updateProject(id, input),
    onSuccess: () => {
      invalidate();
      toast.success('Project updated');
    },
  });
}
export function useDeleteProject() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      invalidate();
      toast.success('Project deleted');
    },
  });
}

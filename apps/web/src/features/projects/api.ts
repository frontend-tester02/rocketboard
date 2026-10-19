import type {
  CreateProjectInput,
  ProjectCounts,
  ProjectDto,
  ProjectListQuery,
  TaskDto,
  UpdateProject,
} from '@rocket/shared';
import { apiClient } from '@/lib/api-client';

interface Envelope<T> {
  data: T;
}

export type ProjectsQuery = Partial<
  Pick<ProjectListQuery, 'status' | 'member' | 'search'>
> & { dateFrom?: string; dateTo?: string };

function cleanParams(q: ProjectsQuery): Record<string, string> {
  const params: Record<string, string> = {};
  for (const [k, v] of Object.entries(q)) {
    if (v === undefined || v === null || v === '') continue;
    params[k] = String(v);
  }
  return params;
}

export async function listProjects(query: ProjectsQuery): Promise<ProjectDto[]> {
  const { data } = await apiClient.get<Envelope<ProjectDto[]>>('/projects', {
    params: cleanParams(query),
  });
  return data.data;
}
export async function getProjectCounts(): Promise<ProjectCounts> {
  const { data } = await apiClient.get<Envelope<ProjectCounts>>('/projects/counts');
  return data.data;
}
export async function getProject(id: string): Promise<ProjectDto> {
  const { data } = await apiClient.get<Envelope<ProjectDto>>(`/projects/${id}`);
  return data.data;
}
export async function getProjectTasks(id: string): Promise<TaskDto[]> {
  const { data } = await apiClient.get<Envelope<TaskDto[]>>(`/projects/${id}/tasks`);
  return data.data;
}
export async function createProject(input: CreateProjectInput): Promise<ProjectDto> {
  const { data } = await apiClient.post<Envelope<ProjectDto>>('/projects', input);
  return data.data;
}
export async function updateProject(id: string, input: UpdateProject): Promise<ProjectDto> {
  const { data } = await apiClient.patch<Envelope<ProjectDto>>(`/projects/${id}`, input);
  return data.data;
}
export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}

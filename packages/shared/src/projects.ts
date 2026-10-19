// Project management contracts shared between web and api.
import { z } from 'zod';
import { ProjectStatus, projectStatusSchema } from './enums';

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100),
  description: z.string().trim().max(2000).optional(),
  client: z.string().trim().max(100).optional(),
  coverColor: z.string().trim().max(20).optional(),
  icon: z.string().trim().max(40).optional(),
  members: z.array(z.string().trim().min(1)).optional().default([]),
  status: projectStatusSchema.optional().default(ProjectStatus.Ongoing),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  budget: z.number().nonnegative().optional(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
});
export type CreateProject = z.infer<typeof createProjectSchema>;
export type CreateProjectInput = z.input<typeof createProjectSchema>;

export const updateProjectSchema = createProjectSchema.partial();
export type UpdateProject = z.infer<typeof updateProjectSchema>;

export const projectListQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  member: z.string().trim().min(1).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});
export type ProjectListQuery = z.infer<typeof projectListQuerySchema>;

export interface ProjectDto {
  id: string;
  owner: string;
  name: string;
  description?: string;
  client?: string;
  coverColor?: string;
  icon?: string;
  members: string[];
  status: ProjectStatus;
  progress: number;
  taskCount: number;
  startDate?: string;
  endDate?: string;
  budget?: number;
  tags: string[];
  board?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectCounts {
  all: number;
  ongoing: number;
  hold: number;
  done: number;
}

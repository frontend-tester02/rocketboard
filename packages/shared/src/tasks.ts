// Task board (kanban) contracts shared between web and api.
import { z } from 'zod';
import { TaskPriority, taskPrioritySchema } from './enums';

// ── Boards + columns ────────────────────────────────────────────────────────
export interface BoardColumn {
  id: string;
  title: string;
  order: number;
  color?: string;
}

export const createBoardSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  project: z.string().trim().min(1).optional(),
  members: z.array(z.string().trim().min(1)).optional().default([]),
});
export type CreateBoard = z.infer<typeof createBoardSchema>;
export type CreateBoardInput = z.input<typeof createBoardSchema>;

export const updateBoardSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  members: z.array(z.string().trim().min(1)).optional(),
});
export type UpdateBoard = z.infer<typeof updateBoardSchema>;

export const createColumnSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(60),
  color: z.string().trim().max(20).optional(),
});
export type CreateColumn = z.infer<typeof createColumnSchema>;

export const updateColumnSchema = z.object({
  title: z.string().trim().min(1).max(60).optional(),
  color: z.string().trim().max(20).optional(),
  order: z.number().optional(),
});
export type UpdateColumn = z.infer<typeof updateColumnSchema>;

// ── Tasks ────────────────────────────────────────────────────────────────────
export const checklistItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().trim().min(1).max(200),
  done: z.boolean().optional().default(false),
});
export type ChecklistItem = z.infer<typeof checklistItemSchema>;

export const taskAttachmentSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().trim().url(),
  size: z.number().int().nonnegative().optional(),
});
export type TaskAttachment = z.infer<typeof taskAttachmentSchema>;

export const createTaskSchema = z.object({
  board: z.string().trim().min(1),
  columnId: z.string().trim().min(1),
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(5000).optional(),
  assignees: z.array(z.string().trim().min(1)).optional().default([]),
  labels: z.array(z.string().trim().min(1)).optional().default([]),
  dueDate: z.coerce.date().optional(),
  priority: taskPrioritySchema.optional().default(TaskPriority.Medium),
  checklist: z.array(checklistItemSchema).optional().default([]),
  attachments: z.array(taskAttachmentSchema).optional().default([]),
  coverImage: z.string().trim().url().optional(),
});
export type CreateTask = z.infer<typeof createTaskSchema>;
export type CreateTaskInput = z.input<typeof createTaskSchema>;

export const updateTaskSchema = z.object({
  columnId: z.string().trim().min(1).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  assignees: z.array(z.string().trim().min(1)).optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
  dueDate: z.coerce.date().nullable().optional(),
  priority: taskPrioritySchema.optional(),
  checklist: z.array(checklistItemSchema).optional(),
  attachments: z.array(taskAttachmentSchema).optional(),
  coverImage: z.string().trim().url().nullable().optional(),
});
export type UpdateTask = z.infer<typeof updateTaskSchema>;

export const moveTaskSchema = z.object({
  columnId: z.string().trim().min(1),
  order: z.number(),
});
export type MoveTask = z.infer<typeof moveTaskSchema>;

// ── Task labels + comments ────────────────────────────────────────────────────
export const createTaskLabelSchema = z.object({
  name: z.string().trim().min(1).max(40),
  color: z.string().trim().min(1).max(20),
});
export type CreateTaskLabel = z.infer<typeof createTaskLabelSchema>;
export const updateTaskLabelSchema = createTaskLabelSchema.partial();
export type UpdateTaskLabel = z.infer<typeof updateTaskLabelSchema>;

export const createTaskCommentSchema = z.object({
  text: z.string().trim().min(1).max(2000),
});
export type CreateTaskComment = z.infer<typeof createTaskCommentSchema>;

// ── DTOs ───────────────────────────────────────────────────────────────────
export interface TaskDto {
  id: string;
  board: string;
  columnId: string;
  order: number;
  title: string;
  description?: string;
  assignees: string[];
  labels: string[];
  dueDate?: string;
  priority: TaskPriority;
  checklist: ChecklistItem[];
  attachments: TaskAttachment[];
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardDto {
  id: string;
  owner: string;
  name: string;
  project?: string;
  members: string[];
  columns: BoardColumn[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BoardWithTasks extends BoardDto {
  tasks: TaskDto[];
}

export interface TaskLabelDto {
  id: string;
  owner: string;
  name: string;
  color: string;
}

export interface TaskCommentDto {
  id: string;
  task: string;
  author: { id: string; firstName: string; lastName: string; avatar?: string };
  text: string;
  createdAt?: string;
}

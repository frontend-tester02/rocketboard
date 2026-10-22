// Notes contracts shared between web and api.
import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().trim().max(200).optional().default(''),
  content: z.string().max(20000).optional().default(''),
  color: z.string().trim().max(20).optional(),
  tags: z.array(z.string().trim().min(1)).optional().default([]),
  isPinned: z.boolean().optional().default(false),
});
export type CreateNote = z.infer<typeof createNoteSchema>;
export type CreateNoteInput = z.input<typeof createNoteSchema>;

export const updateNoteSchema = createNoteSchema.partial();
export type UpdateNote = z.infer<typeof updateNoteSchema>;

export const noteListQuerySchema = z.object({
  search: z.string().trim().optional(),
  tag: z.string().trim().min(1).optional(),
});
export type NoteListQuery = z.infer<typeof noteListQuerySchema>;

export interface NoteDto {
  id: string;
  owner: string;
  title: string;
  content: string;
  color?: string;
  tags: string[];
  isPinned: boolean;
  createdAt?: string;
  updatedAt?: string;
}

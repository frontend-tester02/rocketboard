// Internal mail contracts shared between web and api.
import { z } from 'zod';
import { MailFolder, mailFolderSchema } from './enums';
import { paginationQuerySchema } from './pagination';

export const mailAttachmentSchema = z.object({
  name: z.string().trim().min(1),
  url: z.string().trim().url(),
  size: z.number().int().nonnegative().optional(),
});
export type MailAttachment = z.infer<typeof mailAttachmentSchema>;

/** Send a new mail. */
export const composeMailSchema = z.object({
  to: z.array(z.string().trim().toLowerCase().email()).min(1, 'Add a recipient'),
  cc: z.array(z.string().trim().toLowerCase().email()).optional().default([]),
  subject: z.string().trim().max(200).optional().default(''),
  body: z.string().optional().default(''),
  attachments: z.array(mailAttachmentSchema).optional().default([]),
});
export type ComposeMail = z.infer<typeof composeMailSchema>;
export type ComposeMailInput = z.input<typeof composeMailSchema>;

/** Save a draft (recipients optional). */
export const draftMailSchema = z.object({
  to: z.array(z.string().trim().toLowerCase().email()).optional().default([]),
  cc: z.array(z.string().trim().toLowerCase().email()).optional().default([]),
  subject: z.string().trim().max(200).optional().default(''),
  body: z.string().optional().default(''),
  attachments: z.array(mailAttachmentSchema).optional().default([]),
});
export type DraftMail = z.infer<typeof draftMailSchema>;
export type DraftMailInput = z.input<typeof draftMailSchema>;

export const mailListQuerySchema = paginationQuerySchema.extend({
  folder: mailFolderSchema.optional(),
  label: z.string().trim().min(1).optional(),
});
export type MailListQuery = z.infer<typeof mailListQuerySchema>;

export const patchMailSchema = z.object({
  isRead: z.boolean().optional(),
  isStarred: z.boolean().optional(),
  folder: mailFolderSchema.optional(),
  labels: z.array(z.string().trim().min(1)).optional(),
});
export type PatchMail = z.infer<typeof patchMailSchema>;

export const createMailLabelSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(40),
  color: z.string().trim().min(1).max(20),
});
export type CreateMailLabel = z.infer<typeof createMailLabelSchema>;
export const updateMailLabelSchema = createMailLabelSchema.partial();
export type UpdateMailLabel = z.infer<typeof updateMailLabelSchema>;

export interface MailParty {
  name: string;
  email: string;
}

export interface MailDto {
  id: string;
  owner: string;
  folder: MailFolder;
  from: MailParty;
  to: string[];
  cc: string[];
  subject: string;
  body: string;
  attachments: MailAttachment[];
  threadId?: string;
  labels: string[];
  isRead: boolean;
  isStarred: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MailLabelDto {
  id: string;
  owner: string;
  name: string;
  color: string;
}

export type MailCounts = Record<MailFolder, number> & { unread: number };

// Shared enums for Rocket.
//
// Each enum is declared as an `as const` object so it has a runtime value
// (handy for `Object.values(...)` in Mongoose `enum:` options) together with a
// matching TypeScript union type and a Zod schema (via `z.nativeEnum`) usable
// on both the web and api sides.
import { z } from 'zod';

/** Application user roles / permission levels. */
export const UserRole = {
  Admin: 'admin',
  Manager: 'manager',
  User: 'user',
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];
export const userRoleSchema = z.nativeEnum(UserRole);

/** Product availability status. */
export const ProductStatus = {
  Available: 'available',
  Disabled: 'disabled',
} as const;
export type ProductStatus = (typeof ProductStatus)[keyof typeof ProductStatus];
export const productStatusSchema = z.nativeEnum(ProductStatus);

/** Order lifecycle status. */
export const OrderStatus = {
  Pending: 'pending',
  Processing: 'processing',
  Shipped: 'shipped',
  Refunded: 'refunded',
  Cancelled: 'cancelled',
} as const;
export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];
export const orderStatusSchema = z.nativeEnum(OrderStatus);

/** Payment method used on an order. */
export const PaymentType = {
  Card: 'card',
  Paypal: 'paypal',
  BankTransfer: 'bank_transfer',
  Cash: 'cash',
} as const;
export type PaymentType = (typeof PaymentType)[keyof typeof PaymentType];
export const paymentTypeSchema = z.nativeEnum(PaymentType);

/** Task priority for board/list tasks. */
export const TaskPriority = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Urgent: 'urgent',
} as const;
export type TaskPriority = (typeof TaskPriority)[keyof typeof TaskPriority];
export const taskPrioritySchema = z.nativeEnum(TaskPriority);

/** Project lifecycle status. */
export const ProjectStatus = {
  Ongoing: 'ongoing',
  Hold: 'hold',
  Done: 'done',
} as const;
export type ProjectStatus = (typeof ProjectStatus)[keyof typeof ProjectStatus];
export const projectStatusSchema = z.nativeEnum(ProjectStatus);

/** Per-user mail folders. */
export const MailFolder = {
  Inbox: 'inbox',
  Sent: 'sent',
  Draft: 'draft',
  Trash: 'trash',
  Spam: 'spam',
} as const;
export type MailFolder = (typeof MailFolder)[keyof typeof MailFolder];
export const mailFolderSchema = z.nativeEnum(MailFolder);

/** Conversation type for the chat module. */
export const ConversationType = {
  Private: 'private',
  Team: 'team',
} as const;
export type ConversationType =
  (typeof ConversationType)[keyof typeof ConversationType];
export const conversationTypeSchema = z.nativeEnum(ConversationType);

/** Wallet transaction direction. */
export const TransactionType = {
  Income: 'income',
  Expense: 'expense',
} as const;
export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];
export const transactionTypeSchema = z.nativeEnum(TransactionType);

/** Notification category. */
export const NotificationType = {
  Message: 'message',
  TaskAssigned: 'task_assigned',
  OrderCreated: 'order_created',
  System: 'system',
} as const;
export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
export const notificationTypeSchema = z.nativeEnum(NotificationType);

/** Supported export formats (used by the export module / ExportMenu). */
export const ExportFormat = {
  Xlsx: 'xlsx',
  Csv: 'csv',
  Pdf: 'pdf',
} as const;
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];
export const exportFormatSchema = z.nativeEnum(ExportFormat);

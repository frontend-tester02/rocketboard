// Order contracts shared between web and api.
import { z } from 'zod';
import { OrderStatus, orderStatusSchema, paymentTypeSchema, type PaymentType } from './enums';
import { paginationQuerySchema } from './pagination';

/** Line item — a snapshot of the product at order time. */
export const orderItemSchema = z.object({
  productId: z.string().trim().optional(),
  name: z.string().trim().min(1),
  price: z.number().nonnegative(),
  qty: z.number().int().positive(),
});
export type OrderItem = z.infer<typeof orderItemSchema>;

export const createOrderSchema = z.object({
  /** Customer id (optional until the customer exists). */
  customer: z.string().trim().min(1).optional(),
  /** Denormalized customer name snapshot, shown in lists. */
  customerName: z.string().trim().min(1, 'Customer is required').max(120),
  items: z.array(orderItemSchema).min(1, 'Add at least one item'),
  paymentType: paymentTypeSchema,
  status: orderStatusSchema.optional().default(OrderStatus.Pending),
  /** Tax amount; defaults to 0 when omitted (totals computed server-side). */
  tax: z.number().nonnegative().optional().default(0),
});
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type CreateOrderInput = z.input<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  note: z.string().trim().max(500).optional(),
});
export type UpdateOrderStatus = z.infer<typeof updateOrderStatusSchema>;

export const orderListQuerySchema = paginationQuerySchema.extend({
  status: orderStatusSchema.optional(),
  paymentType: paymentTypeSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});
export type OrderListQuery = z.infer<typeof orderListQuerySchema>;

export interface OrderHistoryEntry {
  status: OrderStatus;
  at: string;
  note?: string;
}

export interface OrderDto {
  id: string;
  orderNo: string;
  customer?: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType: PaymentType;
  status: OrderStatus;
  history: OrderHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export type OrderCounts = Record<OrderStatus | 'all', number>;

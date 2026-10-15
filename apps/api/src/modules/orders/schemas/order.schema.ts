import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OrderStatus, PaymentType } from '@rocket/shared';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  productId?: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ required: true, min: 1 })
  qty!: number;
}
export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ _id: false })
export class OrderHistoryEntry {
  @Prop({ type: String, enum: Object.values(OrderStatus), required: true })
  status!: OrderStatus;

  @Prop({ required: true })
  at!: Date;

  @Prop()
  note?: string;
}
export const OrderHistoryEntrySchema =
  SchemaFactory.createForClass(OrderHistoryEntry);

@Schema()
export class Order {
  @Prop({ required: true, unique: true })
  orderNo!: string;

  @Prop({ type: Types.ObjectId, ref: 'Customer' })
  customer?: Types.ObjectId;

  @Prop({ required: true, trim: true })
  customerName!: string;

  @Prop({ type: [OrderItemSchema], default: [] })
  items!: OrderItem[];

  @Prop({ required: true, min: 0 })
  subtotal!: number;

  @Prop({ default: 0, min: 0 })
  tax!: number;

  @Prop({ required: true, min: 0 })
  total!: number;

  @Prop({ type: String, enum: Object.values(PaymentType), required: true })
  paymentType!: PaymentType;

  @Prop({
    type: String,
    enum: Object.values(OrderStatus),
    default: OrderStatus.Pending,
  })
  status!: OrderStatus;

  @Prop({ type: [OrderHistoryEntrySchema], default: [] })
  history!: OrderHistoryEntry[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ orderNo: 'text', customerName: 'text' });

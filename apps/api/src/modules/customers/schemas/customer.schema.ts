import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CustomerDocument = HydratedDocument<Customer>;

@Schema({ _id: false })
export class Address {
  @Prop() label?: string;
  @Prop({ required: true }) line1!: string;
  @Prop() line2?: string;
  @Prop({ required: true }) city!: string;
  @Prop() state?: string;
  @Prop({ required: true }) country!: string;
  @Prop() zip?: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ _id: false })
export class PaymentMethod {
  @Prop({ required: true }) brand!: string;
  @Prop({ required: true }) last4!: string;
  @Prop({ required: true }) expMonth!: number;
  @Prop({ required: true }) expYear!: number;
}
export const PaymentMethodSchema = SchemaFactory.createForClass(PaymentMethod);

@Schema()
export class Customer {
  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ required: true, trim: true })
  lastName!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string;

  @Prop()
  phone?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: [AddressSchema], default: [] })
  addresses!: Address[];

  @Prop({ type: [PaymentMethodSchema], default: [] })
  paymentMethods!: PaymentMethod[];

  @Prop({ default: 0 })
  ordersCount!: number;

  @Prop({ default: 0 })
  totalSpent!: number;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.index({ firstName: 'text', lastName: 'text', email: 'text' });

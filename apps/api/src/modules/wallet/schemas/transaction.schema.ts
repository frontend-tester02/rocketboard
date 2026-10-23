import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TransactionDocument = HydratedDocument<Transaction>;

@Schema()
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true })
  type!: string;

  @Prop({ default: 'other' })
  category!: string;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, default: Date.now })
  date!: Date;

  @Prop({ type: Types.ObjectId, ref: 'Card' })
  card?: Types.ObjectId;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ owner: 1, date: -1 });

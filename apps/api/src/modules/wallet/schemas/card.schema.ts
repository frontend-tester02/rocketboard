import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CardDocument = HydratedDocument<Card>;

@Schema()
export class Card {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true })
  brand!: string;

  @Prop({ required: true })
  last4!: string;

  @Prop({ required: true })
  holder!: string;

  @Prop({ required: true })
  expMonth!: number;

  @Prop({ required: true })
  expYear!: number;

  @Prop({ default: 0 })
  balance!: number;
}

export const CardSchema = SchemaFactory.createForClass(Card);

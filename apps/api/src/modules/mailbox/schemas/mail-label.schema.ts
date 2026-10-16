import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MailLabelDocument = HydratedDocument<MailLabel>;

@Schema()
export class MailLabel {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  color!: string;
}

export const MailLabelSchema = SchemaFactory.createForClass(MailLabel);

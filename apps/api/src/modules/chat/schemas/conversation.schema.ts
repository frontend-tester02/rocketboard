import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ConversationType } from '@rocket/shared';
import { HydratedDocument, Types } from 'mongoose';

export type ConversationDocument = HydratedDocument<Conversation>;

@Schema({ _id: false })
export class LastMessage {
  @Prop({ default: '' }) text!: string;
  @Prop({ type: Types.ObjectId, ref: 'User' }) sender?: Types.ObjectId;
  @Prop() createdAt?: Date;
}
export const LastMessageSchema = SchemaFactory.createForClass(LastMessage);

@Schema()
export class Conversation {
  @Prop({
    type: String,
    enum: Object.values(ConversationType),
    default: ConversationType.Private,
  })
  type!: ConversationType;

  @Prop({ trim: true })
  name?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [], index: true })
  members!: Types.ObjectId[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  admins!: Types.ObjectId[];

  @Prop({ type: LastMessageSchema })
  lastMessage?: LastMessage;
}

export const ConversationSchema = SchemaFactory.createForClass(Conversation);

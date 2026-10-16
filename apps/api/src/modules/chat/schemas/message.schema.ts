import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type MessageDocument = HydratedDocument<Message>;

@Schema({ _id: false })
export class ChatAttachment {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) url!: string;
  @Prop() size?: number;
}
export const ChatAttachmentSchema = SchemaFactory.createForClass(ChatAttachment);

@Schema()
export class Message {
  @Prop({ type: Types.ObjectId, ref: 'Conversation', required: true, index: true })
  conversation!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  sender!: Types.ObjectId;

  @Prop({ default: '' })
  text!: string;

  @Prop({ type: [ChatAttachmentSchema], default: [] })
  attachments!: ChatAttachment[];

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  readBy!: Types.ObjectId[];
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ conversation: 1, _id: -1 });

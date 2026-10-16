import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { MailFolder } from '@rocket/shared';
import { HydratedDocument, Types } from 'mongoose';

export type MailDocument = HydratedDocument<Mail>;

@Schema({ _id: false })
export class MailParty {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) email!: string;
}
export const MailPartySchema = SchemaFactory.createForClass(MailParty);

@Schema({ _id: false })
export class MailAttachment {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) url!: string;
  @Prop() size?: number;
}
export const MailAttachmentSchema = SchemaFactory.createForClass(MailAttachment);

@Schema()
export class Mail {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(MailFolder),
    default: MailFolder.Inbox,
    index: true,
  })
  folder!: MailFolder;

  @Prop({ type: MailPartySchema, required: true })
  from!: MailParty;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  fromUser?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  to!: string[];

  @Prop({ type: [String], default: [] })
  cc!: string[];

  @Prop({ default: '' })
  subject!: string;

  @Prop({ default: '' })
  body!: string;

  @Prop({ type: [MailAttachmentSchema], default: [] })
  attachments!: MailAttachment[];

  @Prop()
  threadId?: string;

  @Prop({ type: [String], default: [] })
  labels!: string[];

  @Prop({ default: false })
  isRead!: boolean;

  @Prop({ default: false })
  isStarred!: boolean;
}

export const MailSchema = SchemaFactory.createForClass(Mail);
MailSchema.index({ subject: 'text', body: 'text' });

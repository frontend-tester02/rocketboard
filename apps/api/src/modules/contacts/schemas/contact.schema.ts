import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ContactDocument = HydratedDocument<Contact>;

@Schema()
export class Contact {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  firstName!: string;

  @Prop({ default: '' })
  lastName!: string;

  @Prop({ default: '' })
  email!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: '' })
  company!: string;

  @Prop({ default: '' })
  jobTitle!: string;

  @Prop()
  avatar?: string;

  @Prop({ default: '' })
  address!: string;

  @Prop({ default: false, index: true })
  isFavorite!: boolean;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const ContactSchema = SchemaFactory.createForClass(Contact);
ContactSchema.index({ firstName: 'text', lastName: 'text', email: 'text', company: 'text' });

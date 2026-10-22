import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type NoteDocument = HydratedDocument<Note>;

@Schema()
export class Note {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ default: '' })
  title!: string;

  @Prop({ default: '' })
  content!: string;

  @Prop()
  color?: string;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ default: false })
  isPinned!: boolean;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
NoteSchema.index({ title: 'text', content: 'text' });

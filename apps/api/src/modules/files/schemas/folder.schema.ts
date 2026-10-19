import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FolderDocument = HydratedDocument<Folder>;

@Schema()
export class Folder {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', default: null, index: true })
  parent!: Types.ObjectId | null;

  @Prop()
  color?: string;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

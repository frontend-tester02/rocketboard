import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FileDocument = HydratedDocument<FileEntity>;

@Schema({ collection: 'files' })
export class FileEntity {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Folder', default: null, index: true })
  folder!: Types.ObjectId | null;

  @Prop({ required: true, default: 0 })
  size!: number;

  @Prop({ required: true })
  mimeType!: string;

  @Prop({ required: true })
  storageKey!: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  sharedWith!: Types.ObjectId[];

  @Prop({ default: false })
  isStarred!: boolean;
}

export const FileSchema = SchemaFactory.createForClass(FileEntity);

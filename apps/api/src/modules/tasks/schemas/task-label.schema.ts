import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskLabelDocument = HydratedDocument<TaskLabel>;

@Schema()
export class TaskLabel {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  color!: string;
}

export const TaskLabelSchema = SchemaFactory.createForClass(TaskLabel);

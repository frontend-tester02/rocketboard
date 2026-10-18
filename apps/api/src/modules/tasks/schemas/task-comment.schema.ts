import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TaskCommentDocument = HydratedDocument<TaskComment>;

@Schema()
export class TaskComment {
  @Prop({ type: Types.ObjectId, ref: 'Task', required: true, index: true })
  task!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  author!: Types.ObjectId;

  @Prop({ required: true })
  text!: string;
}

export const TaskCommentSchema = SchemaFactory.createForClass(TaskComment);

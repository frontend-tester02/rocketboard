import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TaskPriority } from '@rocket/shared';
import { HydratedDocument, Types } from 'mongoose';

export type TaskDocument = HydratedDocument<Task>;

@Schema({ _id: false })
export class ChecklistItem {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) text!: string;
  @Prop({ default: false }) done!: boolean;
}
export const ChecklistItemSchema = SchemaFactory.createForClass(ChecklistItem);

@Schema({ _id: false })
export class TaskAttachment {
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) url!: string;
  @Prop() size?: number;
}
export const TaskAttachmentSchema = SchemaFactory.createForClass(TaskAttachment);

@Schema()
export class Task {
  @Prop({ type: Types.ObjectId, ref: 'Board', required: true, index: true })
  board!: Types.ObjectId;

  @Prop({ required: true })
  columnId!: string;

  @Prop({ default: 0 })
  order!: number;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  assignees!: Types.ObjectId[];

  @Prop({ type: [String], default: [] })
  labels!: string[];

  @Prop()
  dueDate?: Date;

  @Prop({
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.Medium,
  })
  priority!: TaskPriority;

  @Prop({ type: [ChecklistItemSchema], default: [] })
  checklist!: ChecklistItem[];

  @Prop({ type: [TaskAttachmentSchema], default: [] })
  attachments!: TaskAttachment[];

  @Prop()
  coverImage?: string;
}

export const TaskSchema = SchemaFactory.createForClass(Task);
TaskSchema.index({ board: 1, columnId: 1, order: 1 });

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ActivityDocument = HydratedDocument<Activity>;

@Schema()
export class Activity {
  @Prop({ type: Types.ObjectId, ref: 'User', index: true })
  actor?: Types.ObjectId;

  @Prop({ required: true })
  action!: string;

  @Prop({ required: true, index: true })
  entityType!: string;

  @Prop({ required: true })
  entityId!: string;

  @Prop({ type: Object })
  meta?: Record<string, unknown>;
}

export const ActivitySchema = SchemaFactory.createForClass(Activity);
ActivitySchema.index({ createdAt: -1 });

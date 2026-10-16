import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type EventDocument = HydratedDocument<Event>;

@Schema()
export class Event {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Calendar', required: true, index: true })
  calendar!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title!: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  start!: Date;

  @Prop({ required: true })
  end!: Date;

  @Prop({ default: false })
  allDay!: boolean;

  @Prop()
  location?: string;

  @Prop({ type: [String], default: [] })
  attendees!: string[];

  @Prop()
  reminder?: number;

  @Prop()
  color?: string;
}

export const EventSchema = SchemaFactory.createForClass(Event);
EventSchema.index({ owner: 1, start: 1, end: 1 });

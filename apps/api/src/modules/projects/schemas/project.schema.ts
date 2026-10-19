import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProjectStatus } from '@rocket/shared';
import { HydratedDocument, Types } from 'mongoose';

export type ProjectDocument = HydratedDocument<Project>;

@Schema()
export class Project {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  client?: string;

  @Prop()
  coverColor?: string;

  @Prop()
  icon?: string;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members!: Types.ObjectId[];

  @Prop({
    type: String,
    enum: Object.values(ProjectStatus),
    default: ProjectStatus.Ongoing,
    index: true,
  })
  status!: ProjectStatus;

  @Prop()
  startDate?: Date;

  @Prop()
  endDate?: Date;

  @Prop()
  budget?: number;

  @Prop({ type: [String], default: [] })
  tags!: string[];
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
ProjectSchema.index({ name: 'text', description: 'text', client: 'text' });

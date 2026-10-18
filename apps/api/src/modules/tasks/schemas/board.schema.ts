import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type BoardDocument = HydratedDocument<Board>;

@Schema({ _id: false })
export class BoardColumn {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) title!: string;
  @Prop({ default: 0 }) order!: number;
  @Prop() color?: string;
}
export const BoardColumnSchema = SchemaFactory.createForClass(BoardColumn);

@Schema()
export class Board {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  owner!: Types.ObjectId;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, ref: 'Project' })
  project?: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'User', default: [] })
  members!: Types.ObjectId[];

  @Prop({ type: [BoardColumnSchema], default: [] })
  columns!: BoardColumn[];
}

export const BoardSchema = SchemaFactory.createForClass(Board);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProductStatus } from '@rocket/shared';
import { HydratedDocument, Types } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ _id: false })
export class Shipping {
  @Prop({ min: 0 })
  weight?: number;

  @Prop({ min: 0 })
  width?: number;

  @Prop({ min: 0 })
  height?: number;

  @Prop({ min: 0 })
  length?: number;
}
export const ShippingSchema = SchemaFactory.createForClass(Shipping);

@Schema()
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true })
  sku!: string;

  @Prop({ default: '' })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Category' })
  category?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags!: string[];

  @Prop({ type: [String], default: [] })
  images!: string[];

  @Prop({ required: true, min: 0 })
  price!: number;

  @Prop({ min: 0 })
  taxIncludedPrice?: number;

  @Prop()
  taxRule?: string;

  @Prop({ min: 0 })
  unitPrice?: number;

  @Prop({ default: 0, min: 0 })
  stock!: number;

  @Prop({
    type: String,
    enum: Object.values(ProductStatus),
    default: ProductStatus.Available,
  })
  status!: ProductStatus;

  @Prop({ type: ShippingSchema })
  shipping?: Shipping;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Full-text index over the searchable fields.
ProductSchema.index({ name: 'text', sku: 'text', description: 'text' });

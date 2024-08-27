import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { ProductStatusEnums, ProductTypeEnums } from 'src/constants';
import { Currencies } from 'src/utils/constants';

const currencyEnums = Object.keys(Currencies);

export type ProductDocument = Product & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({
    type: String,
    required: true,
  })
  color: string;

  @Prop({ type: Number })
  discount?: number;

  @Prop({ type: Number })
  maximumOrderPerCarton?: number;

  @Prop({ type: Number })
  unitPerCarton?: number;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  code: string;

  @Prop({ type: String, required: true })
  description: string;

  @Prop({ type: Number, required: true })
  price: number;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true })
  vendor: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  })
  categoryId: mongoose.Types.ObjectId;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Category' })
  subcategoryId?: mongoose.Types.ObjectId;

  @Prop({ type: Number, required: false })
  sellingPrice?: number;

  @Prop({ default: 'EN' })
  language: string;

  @Prop({ type: String, required: false })
  sku?: string;

  @Prop({ type: String, required: false })
  videoUrl?: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: String, required: true })
  size: string;

  @Prop({ type: Number, default: 0 })
  soldQuantity: number;

  @Prop({ default: true })
  inStock: boolean;

  @Prop({ default: true })
  isTaxable: boolean;

  @Prop({ default: false })
  inFlashSale: boolean;

  @Prop({ type: Number, required: false })
  shippingClassId?: number;

  @Prop({ enum: ProductStatusEnums, default: ProductStatusEnums.PENDING })
  status: string;

  @Prop({ default: ProductTypeEnums.RETAIL, enum: ProductTypeEnums })
  productType: string;

  @Prop({ type: String, required: false })
  unit: string;

  @Prop({ type: Number, required: false })
  height?: number;

  @Prop({ type: Number, required: false })
  width?: number;

  @Prop({ type: Number, required: false })
  length?: number;

  @Prop({ type: [{ id: Number, url: String }], required: true })
  images: { id: number; url: string }[];

  @Prop({ type: String, required: true })
  featured_image: string;

  @Prop({ type: String, required: false })
  manufacturer?: string;

  @Prop({ type: String, required: false })
  comments?: string;

  @Prop({ type: String, enum: currencyEnums, required: false })
  currency?: string;

  @Prop({ type: Boolean, required: false })
  isDigital?: boolean;

  @Prop({ type: Number, required: false })
  ratings?: number;

  @Prop({ type: Number, required: false })
  totalReviews?: number;

  @Prop({ type: String, required: false })
  myReview?: string;

  @Prop({ default: false })
  inWishlist: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderStatusEnum, PaymentStatus } from 'src/constants';

export type SingleDropshippingDocument = SingleDropshipping & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SingleDropshipping {
  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  deliveryStatus: OrderStatusEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Vendor' })
  vendorId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Order' })
  orderId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product',
  })
  productId: string;

  @Prop({ type: Number, required: true })
  quantity: number;

  @Prop({ type: Number, required: true })
  amount: number;
}

export const SingleDropshippingSchema =
  SchemaFactory.createForClass(SingleDropshipping);

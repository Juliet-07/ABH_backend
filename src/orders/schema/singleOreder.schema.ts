import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { OrderStatusEnum, PaymentStatus } from 'src/constants';

export type SingleOrderDocument = SingleOrder & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SingleOrder {
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
    type: [{
      productId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
      quantity: { type: Number, required: true },
      amount: { type: Number, required: true },
    }],
    required: true,
  })
  products: {
    productId: string;
    quantity: number;
    amount: number;
  }[];

  @Prop({ type: Number, required: true })
  totalAmount: number;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: false },
      town: { type: String, required: false },
    },
    required: true,
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country?: string;
    town?: string;
  };
}

export const SingleOrderSchema = SchemaFactory.createForClass(SingleOrder);

import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {
  OrderStatusEnum,
  PaymentGatewayEnums,
  PaymentStatus,
} from 'src/constants';

export type SingleShippingDocument = SingleShipping & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class SingleShipping {
  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  deliveryStatus: OrderStatusEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
  userId: string;

  @Prop([
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Product',
      },
      quantityShipped: { type: Number, required: true },
      quantity: { type: Number, required: false },
      quantityLeft: { type: Number, required: true },
      vendorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Vendor',
      },
    },
  ])
  products: {
    productId: string;
    quantity: number;
    quantityShipped: number;
    quantityLeft: number;
    vendorId: string;
  };

  @Prop({ type: String, required: true })
  reference: string;

  @Prop({ enum: PaymentGatewayEnums, required: true })
  paymentGateway: PaymentGatewayEnums;

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

  @Prop({
    type: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
  })
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
  })
  vendorId: string;

  @Prop({ type: Number, required: true })
  shippingFee: number;

  @Prop({ type: Number, required: true })
  vat: number;

  @Prop({ type: Number, required: true })
  totalAmount: number;
}

export const SingleShippingSchema =
  SchemaFactory.createForClass(SingleShipping);

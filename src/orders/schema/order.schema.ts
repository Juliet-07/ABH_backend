import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
  OrderStatusEnum,
  PaymentGatewayEnums,
  PaymentStatus,
  ShippingMethodEnums,
} from 'src/constants';

export type OrderDocument = Order & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Order {
  @Prop({ type: String, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({
    type: String,
    enum: OrderStatusEnum,
    default: OrderStatusEnum.PENDING,
  })
  deliveryStatus: OrderStatusEnum;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  userId: string;

  @Prop({
    type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: { type: Number, required: true },
        vendorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Vendor',
          required: true,
        },
      },
    ],
    required: true,
  })
  products: {
    productId: string;
    quantity: number;
    vendorId: string;
  }[];

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: false,
  })
  transactionId: string;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  price: number;

  @Prop({
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: false },
      town: { type: String, required: true },
      townId: { type: String, required: true },
    },
    required: true,
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country?: string;
    town: string;
    townId: string;
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
    type: {
      street: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String },
    },
    nullable: true,
  })
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
  };

  @Prop({ type: String, enum: ShippingMethodEnums, required: false })
  shippingMethod: ShippingMethodEnums;

  @Prop({ required: true })
  reference: string;

  @Prop({ type: Number, required: true })
  shippingFee: number;

  @Prop({ type: Number, required: true })
  vat: number;

  @Prop({ type: String, enum: PaymentGatewayEnums, required: true })
  paymentGateway: PaymentGatewayEnums;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

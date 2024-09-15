import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import {
  OrderStatusEnum,
  PaymentGatewayEnums,
  PaymentStatus,
} from 'src/constants';

export type DropshippingDocument = Dropshipping & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Dropshipping {
  @Prop({ enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @Prop({ enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
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
    ref: 'Transaction',
    required: true,
  })
  transactionId: string;

  @Prop({ type: Number, required: false })
  quantity: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  reference: string;

  @Prop({ type: Number, required: true })
  vat: number;

  @Prop({ enum: PaymentGatewayEnums, required: true })
  paymentGateway: PaymentGatewayEnums;

  @Prop({
    type: {
      plan: { type: String, required: true },
      amount: { type: Number, required: true },
    },
    //required: false, 
  })
  subscriptionDetails: {
    plan: string;
    amount: number;
  };
}

export const DropshippingSchema = SchemaFactory.createForClass(Dropshipping);

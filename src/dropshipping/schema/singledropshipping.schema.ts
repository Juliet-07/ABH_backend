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

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Dropshipping',
  })
  dropshippingId: string;

  @Prop({
    type: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        quantity: { type: Number, required: true },
        amount: { type: Number, required: true },
      },
    ],
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
      street: { type: String, required: false },
      city: { type: String, required: false },
      state: { type: String, required: false },
      country: { type: String, required: false },
      town: { type: String, required: false },
    },
    required: false,
  })
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    country?: string;
    town?: string;
  };

  @Prop({ required: false, type: String })
  reference: string;

  // @Prop({
  //   type: [
  //     {
  //       productId: {
  //         type: mongoose.Schema.Types.ObjectId,
  //         required: false,
  //         ref: 'Product',
  //       },
  //       quantity: { type: Number, required: true },
  //     },
  //   ],
  //   required: false,
  // })
  // itemToShip: {
  //   productId: string;
  //   quantity: number;
  // }[];
}

export const SingleDropshippingSchema =
  SchemaFactory.createForClass(SingleDropshipping);

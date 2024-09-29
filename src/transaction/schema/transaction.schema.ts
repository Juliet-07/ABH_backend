import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { PaymentStatusEnum, PaymentGatewayEnums } from 'src/constants';

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Transaction {
  @Prop({ required: true })
  reference: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Order' })
  orderId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  userId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Dropshipping' })
  dropshippingId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Shipping' })
  shippingId: string;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  totalProductAmount: number;

  @Prop({ type: Number, required: false })
  shippingFee: number;

  @Prop({ enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
  status: string;

  @Prop({ default: 'ONLINE' })
  paymentMethod: string;

  @Prop({ enum: PaymentGatewayEnums, default: PaymentGatewayEnums.HYDROGENPAY })
  paymentGateway: string;

  @Prop({ nullable: true })
  paymentReference: string;

  @Prop({ type: Number, required: true })
  vat: number;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

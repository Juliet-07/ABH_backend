import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PaymentStatusEnum, PaymentGatewayEnums } from 'src/constants';


export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Transaction {

  @Prop({ required: true })
  reference: string;

//   @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] })
//   orders: Order[];

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({ type: Number, required: true })
  totalProductAmount: number;

  @Prop({ type: Number, required: true })
  shippingFee: number;

  @Prop({ enum: PaymentStatusEnum, default: PaymentStatusEnum.PENDING })
  status: string;

  @Prop({ default: 'ONLINE' })
  paymentMethod: string;

  @Prop({ enum: PaymentGatewayEnums, default: PaymentGatewayEnums.HYDROGENPAY })
  paymentGateway: string;

  @Prop({ nullable: true })
  paymentReference: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

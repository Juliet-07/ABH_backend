import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { OrderStatusEnum, ShippingMethodEnums } from 'src/constants';

export type OrderDocument = Order & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Order {

     @Prop({ enum: OrderStatusEnum, default: OrderStatusEnum.PENDING })
     status: OrderStatusEnum;

     @Prop({ enum: OrderStatusEnum, nullable: true })  // Adjusted type for consistency
     deliveryStatus: OrderStatusEnum;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
     userId: string

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true })
     vendorId: string

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true })
     productId: string

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true })
     transactionId: string

     @Prop({ type: Number, required: true })
     quantity: number;


     @Prop({required: true})
     totalAmount: number;

     @Prop({
          type: {
               street: { type: String, required: true },
               city: { type: String, required: true },
               state: { type: String, required: true },
               country: { type: String, required: true },
          },
          required: true
     })
     shippingAddress: {
          street: string;
          city: string;
          state: string;
          country: string;
     };

     @Prop({
          type: {
               street: { type: String },
               city: { type: String },
               state: { type: String },
               country: { type: String },
          },
          nullable: true
     })
     billingAddress?: {
          street?: string;
          city?: string;
          state?: string;
          country?: string;
     };

     @Prop({ enum: ShippingMethodEnums, required: true })
     shippingMethod: ShippingMethodEnums;

     @Prop({ required: true })
     reference: string;

}

export const OrderSchema = SchemaFactory.createForClass(Order);

import { SchemaFactory, Schema, Prop } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";
import { SubscriptionStatus, SubscriptionTypeEnum } from "src/constants";




export type OrderDocument = Subscription & Document;




@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Subscription {

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
     userId: string;

     @Prop({ required: true, enum: SubscriptionTypeEnum })
     type: SubscriptionTypeEnum;


     @Prop({ required: true })
     startDate: Date;

     @Prop({ required: true })
     endDate: Date;

     @Prop({ default: SubscriptionStatus.INACTIVE })
     status: SubscriptionStatus;

     @Prop({ required: true })
     reference: string
}



export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
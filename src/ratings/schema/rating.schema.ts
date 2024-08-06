
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';


export type RatingDocument = Rating & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Rating {

     @Prop({ type: Number, required: true })
     rating: number;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "User", required: true })
     userId: string;

     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true })
     productId: string;

}


export const RatingSchema = SchemaFactory.createForClass(Rating);




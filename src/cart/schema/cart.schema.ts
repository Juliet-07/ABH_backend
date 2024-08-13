import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema({ _id: false })
export class Item {
     @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Product' })
     productId: string;

     @Prop()
     quantity: number;
}


export const ItemSchema = SchemaFactory.createForClass(Item);


export type CartDocument = Cart & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Cart {
     @Prop({ type: [ItemSchema], default: [] })
     products: Item[];

     @Prop({ type: mongoose.Schema.Types.ObjectId, 
          ref: 'User', 
          unique: true, 
          required: true 
     })
     userId: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ItemDocument = Item & Document;

@Schema()
export class Item {
     @Prop()
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

     @Prop({ unique: true, required: true })
     userId: string;
}

export const CartSchema = SchemaFactory.createForClass(Cart);
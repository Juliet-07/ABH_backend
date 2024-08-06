import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';



export type CategoryDocument = Category & Document;


@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Category {


     @Prop({ required: true, type: String })
     name: string;

     @Prop({ required: true, type:  [String] })
     subcategories: string[];

     @Prop({ type: String })
     description: string;

     @Prop({ required: true, type: String })
     image: string



}



export const CategorySchema = SchemaFactory.createForClass(Category);
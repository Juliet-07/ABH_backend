import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NotificationDocument = Notification & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Notification {

  @Prop({ required: true })
  message: string;

  @Prop({ required: true })
  receiverId: string;

  @Prop({ default: false })
  read: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);



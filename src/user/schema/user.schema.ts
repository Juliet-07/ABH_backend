import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ unique: true, required: true })
  phoneNumber: string;

  @Prop({ required: true })
  code: string;

  @Prop({ required: false })
  referredBy?: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ required: false })
  verificationCode?: string;

  @Prop({ required: false })
  verificationCodeExpiresIn?: Date;

  @Prop({ required: false })
  verifiedAt?: Date;

  @Prop({ required: false })
  forgotPasswordVerificationCode?: string;

  @Prop({ required: false })
  forgotPasswordVerificationCodeExpiresIn?: Date;

  @Prop({ required: false })
  lastPasswordResetAt?: Date;

  @Prop({ select: false, required: true })
  password: string;

  @Prop({ required: false })
  image: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BlockStatusEnums, VendorStatusEnums } from 'src/constants'; // Ensure these enums are properly defined

export type VendorDocument = Vendor & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Vendor {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, unique: true, required: true })
  email: string;

  @Prop({ type: String, unique: true, required: true })
  phoneNumber: string;

  @Prop({ type: String })
  alternatePhoneNumber?: string;

  @Prop({ type: String })
  address?: string;

  @Prop({ type: String })
  code?: string;
  featured_image;

  @Prop({ type: String })
  store?: string;

  @Prop({ type: String })
  country?: string;

  @Prop({ type: String })
  city?: string;

  @Prop({ type: String })
  state?: string;

  @Prop({ enum: VendorStatusEnums, default: VendorStatusEnums.PENDING })
  status: string;

  // Operational Details
  @Prop({ type: String })
  businessType?: string;

  @Prop({ type: String })
  nationalIdentificationNumber?: string;

  @Prop({ type: String })
  taxIdentificationNumber?: string;

  @Prop({ type: String })
  cacRegistrationNumber?: string;

  @Prop({ type: String })
  cacCertificateUrl?: string;

  @Prop({ type: Number })
  referredBy?: number;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ type: String })
  verificationCode?: string;

  @Prop({ type: Date })
  verificationCodeExpiresIn?: Date;

  @Prop({ type: Date })
  verifiedAt?: Date;

  @Prop({ type: String })
  forgotPasswordVerificationCode?: string;

  @Prop({ type: Date })
  forgotPasswordVerificationCodeExpiresIn?: Date;

  @Prop({ type: Date })
  lastPasswordResetAt?: Date;

  @Prop({ type: String, required: false })
  image?: string;

  @Prop({ type: String, select: false })
  password?: string;

  @Prop({ enum: BlockStatusEnums, default: BlockStatusEnums.ACTIVE })
  block: string;
}

export const VendorSchema = SchemaFactory.createForClass(Vendor);

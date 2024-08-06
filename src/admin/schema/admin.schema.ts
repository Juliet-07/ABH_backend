import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { AdminRolesEnums } from 'src/constants';



export type AdminDocument = Admin & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Admin {
     @Prop({ type: String })
     firstName: string;

     @Prop({ type: String })
     lastName: string;

     @Prop({ type: String, unique: true })
     email: string;

     @Prop({ type: String, unique: true })
     phoneNumber: string;

     @Prop({ type: String })
     code: string;

     @Prop({
          type: String,
          enum: AdminRolesEnums,
          default: AdminRolesEnums.SUPER_ADMIN,
     })
     role: AdminRolesEnums;

     @Prop({ default: false })
     verified: boolean;

     @Prop({ type: String, required: false })
     forgotPasswordVerificationCode?: string;

     @Prop({ type: Date, required: false })
     forgotPasswordVerificationCodeExpiresIn?: Date;

     @Prop({ type: Date, required: false })
     lastPasswordResetAt?: Date;

     @Prop()
     password: string;

     @Prop({ type: String, required: false })
     createdBy?: string;

     @Prop({ type: Date, required: false })
     lastLoginAt?: Date;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

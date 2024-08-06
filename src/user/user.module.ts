import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from './schema/user.schem';
import { AdminService } from 'src/admin/admin.service';
import { AdminSchema } from 'src/admin/schema/admin.schema';

@Module({
  imports: [  MongooseModule.forFeature([
    { name: 'User', schema: UserSchema },
    { name: 'Admin', schema: AdminSchema }

  ])],
  exports: [UserService],
  controllers: [UserController],
  providers: [UserService, HelpersService, MailingService, AdminService],
})
export class UserModule { }

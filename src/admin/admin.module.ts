import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminSchema } from './schema/admin.schema';


@Module({
  imports: [  MongooseModule.forFeature([{ name: 'Admin', schema: AdminSchema },])],
  exports: [AdminService],
  controllers: [AdminController],
  providers: [AdminService, HelpersService, MailingService],
})
export class AdminModule { }

import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { AdminModule } from '../admin/admin.module';
import { AzureService } from 'src/utils/uploader/azure';
import { MongooseModule } from '@nestjs/mongoose';
import { VendorSchema } from './schema/vendor.schema';
import { NotificationService } from 'src/notification/notification.service';
import { NotificationSchema } from 'src/notification/schema/notification.schema';


@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Vendor', schema: VendorSchema },
    { name: 'Notification', schema: NotificationSchema },
  ]), AdminModule],
  exports: [VendorsService],
  controllers: [VendorsController],
  providers: [VendorsService, HelpersService, MailingService, AzureService, NotificationService]
})
export class VendorsModule { }

import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';
import { FileUploadService } from '../services/file-upload/file-upload.service';
import { AdminModule } from '../admin/admin.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor]), AdminModule],
  exports: [VendorsService],
  controllers: [VendorsController],
  providers: [VendorsService, HelpersService, MailingService, FileUploadService]
})
export class VendorsModule {}

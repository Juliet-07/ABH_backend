import { Module } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { VendorsController } from './vendors.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor])],
  exports: [VendorsService],
  controllers: [VendorsController],
  providers: [VendorsService, HelpersService, MailingService]
})
export class VendorsModule {}

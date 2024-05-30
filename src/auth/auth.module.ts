import { Module } from '@nestjs/common';
import { VendorsService } from '../vendors/vendors.service';

@Module({
    providers: [VendorsService],
  })
export class AuthModule {}

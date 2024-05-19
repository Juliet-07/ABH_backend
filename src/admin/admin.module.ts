import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { Admin } from './entities/admin.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';

@Module({
  imports: [TypeOrmModule.forFeature([Admin,]),],
  controllers: [AdminController],
  providers: [AdminService, HelpersService, MailingService],
})
export class AdminModule { }

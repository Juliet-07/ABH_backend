import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MailingService } from '../utils/mailing/mailing.service';

@Module({
  imports: [TypeOrmModule.forFeature([User,]),],
  controllers: [UserController],
  providers: [UserService, HelpersService, MailingService],
})
export class UserModule { }

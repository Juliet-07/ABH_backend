import { Module } from '@nestjs/common';
import { HelpersService } from './helpers/helpers.service';
import { MailingService } from './mailing/mailing.service';

@Module({
  providers: [HelpersService, MailingService]
})
export class UtilsModule {}

import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schema/transaction.schema';
import { AdminService } from 'src/admin/admin.service';
import { AdminSchema } from 'src/admin/schema/admin.schema';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { MailingService } from 'src/utils/mailing/mailing.service';
import { UserSchema } from 'src/user/schema/user.schema';
import { UserService } from 'src/user/user.service';
import { AzureService } from 'src/utils/uploader/azure';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Admin', schema: AdminSchema },
      { name: 'User', schema: UserSchema },
    ]),
    AdminModule
  ],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    AdminService,
    HelpersService,
    MailingService,
    UserService,
    AzureService,
  ],
})
export class TransactionModule {}

import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { TransactionController } from './transaction.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TransactionSchema } from './schema/transaction.schema';
import { AdminService } from 'src/admin/admin.service';
import { AdminSchema } from 'src/admin/schema/admin.schema';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { MailingService } from 'src/utils/mailing/mailing.service';


@Module({
  imports: [  MongooseModule.forFeature([
    { name: 'Transaction', schema: TransactionSchema },
    { name: 'Admin', schema: AdminSchema}
  ])],
  controllers: [TransactionController],
  providers: [TransactionService, AdminService, HelpersService, MailingService]
})
export class TransactionModule { }

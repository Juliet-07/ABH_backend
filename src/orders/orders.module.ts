import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [OrdersController],
  providers: [OrdersService]
})
export class OrdersModule {}

import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { VendorsModule } from '../vendors/vendors.module';
import { TransactionModule } from '../transaction/transaction.module';
import { Transaction } from '../transaction/entities/transaction.entity';
import { CartModule } from '../cart/cart.module';
import { AdminModule } from '../admin/admin.module';
import { HydrogenpayService } from '../services/hydrogenpay/hydrogenpay.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart, Product, Transaction]), UserModule, VendorsModule, TransactionModule, CartModule, AdminModule],
  controllers: [OrdersController],
  providers: [OrdersService, HelpersService, HydrogenpayService]
})
export class OrdersModule {}

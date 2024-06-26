import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { HelpersService } from '../utils/helpers/helpers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Cart, Product]), UserModule],
  controllers: [OrdersController],
  providers: [OrdersService, HelpersService]
})
export class OrdersModule {}

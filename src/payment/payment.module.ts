import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentService } from './service/payments.service';
import { OrdersService } from 'src/orders/orders.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from 'src/orders/schema/order.schema';
import { PaymentController } from './controller/payment.controller';
import { CartSchema } from 'src/cart/schema/cart.schema';
import { ProductSchema } from 'src/products/schema/product.schema';
import { TransactionSchema } from 'src/transaction/schema/transaction.schema';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { GIGLogisticsService } from 'src/services/logistic/gig-logistics.service';
import { CartModule } from 'src/cart/cart.module';
import { GIGLogisticsAuthService } from 'src/services/logistic/gig-logistics-auth.service';


@Module({
     imports: [ConfigModule,
          MongooseModule.forFeature([
               { name: 'Order', schema: OrderSchema },
               { name: 'Cart', schema: CartSchema },
               { name: 'Product', schema: ProductSchema },
               { name: 'Transaction', schema: TransactionSchema },]),
               CartModule
     ],
     controllers: [PaymentController],
     providers: [PaymentService, OrdersService, HelpersService, GIGLogisticsService, GIGLogisticsAuthService],
     exports: [PaymentService],
})
export class PaymentModule { }
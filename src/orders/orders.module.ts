import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { UserModule } from '../user/user.module';
import { HelpersService } from '../utils/helpers/helpers.service';
import { VendorsModule } from '../vendors/vendors.module';
import { TransactionModule } from '../transaction/transaction.module';
import { CartModule } from '../cart/cart.module';
import { AdminModule } from '../admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from './schema/order.schema';
import { CartSchema } from 'src/cart/schema/cart.schema';
import { ProductSchema } from 'src/products/schema/product.schema';
import { TransactionSchema } from 'src/transaction/schema/transaction.schema';
import { AdminSchema } from 'src/admin/schema/admin.schema';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentService } from 'src/payment/service/payments.service';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { UserSchema } from 'src/user/schema/user.schem';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Order', schema: OrderSchema },
    { name: 'Cart', schema: CartSchema },
    { name: 'Product', schema: ProductSchema },
    { name: 'Transaction', schema: TransactionSchema },
    { name: 'User', schema: UserSchema },
    { name: 'Admin', schema: AdminSchema },

    ,]),
    UserModule,
    VendorsModule,
    TransactionModule,
    CartModule,
    AdminModule,
    PaymentModule,
    SubscriptionModule,

  ],
  exports: [],
  controllers: [OrdersController],
  providers: [OrdersService, HelpersService, PaymentService]
})
export class OrdersModule { }

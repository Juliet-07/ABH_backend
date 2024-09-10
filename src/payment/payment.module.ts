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
import { CartModule } from 'src/cart/cart.module';
import { SubscriptionService } from 'src/subscription/service/subscription.service';
import { SubscriptionSchema } from 'src/subscription/schema/subscription.schema';
import { UserModule } from 'src/user/user.module';
import { UserSchema } from 'src/user/schema/user.schem';
import { VendorSchema } from 'src/vendors/schema/vendor.schema';
import { LogisticService } from 'src/logistics/service/logistic.service';
import { SingleOrderSchema } from 'src/orders/schema/singleOreder.schema';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'Cart', schema: CartSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Subscription', schema: SubscriptionSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Vendor', schema: VendorSchema },
      { name: 'SingleOrder', schema: SingleOrderSchema },
    ]),
    CartModule,
    UserModule,
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    OrdersService,
    HelpersService,
    SubscriptionService,LogisticService
  ],
  exports: [PaymentService,],
})
export class PaymentModule {}

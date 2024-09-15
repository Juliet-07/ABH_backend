import { MongooseModule } from '@nestjs/mongoose';
import { Module } from '@nestjs/common';
import { AdminModule } from 'src/admin/admin.module';
import { AdminSchema } from 'src/admin/schema/admin.schema';
import { CartModule } from 'src/cart/cart.module';
import { DropshippingSchema } from 'src/dropshipping/schema/dropshipping.schema';
import { InventorySchema } from 'src/dropshipping/schema/inventory.schema';
import { PaymentModule } from 'src/payment/payment.module';
import { PaymentService } from 'src/payment/service/payments.service';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { TransactionModule } from 'src/transaction/transaction.module';
import { UserSchema } from 'src/user/schema/user.schema';
import { UserModule } from 'src/user/user.module';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { VendorsModule } from 'src/vendors/vendors.module';
import { ShippingController } from './controller/shippment.controller';
import { ShippingSchema } from './schema/shipment.schema.';
import { OrderSchema } from 'src/orders/schema/order.schema';
import { OrdersService } from 'src/orders/orders.service';
import { TransactionSchema } from 'src/transaction/schema/transaction.schema';
import { SingleDropshippingSchema } from 'src/dropshipping/schema/singledropshipping.schema';
import { CartSchema } from 'src/cart/schema/cart.schema';
import { SingleOrderSchema } from 'src/orders/schema/singleOreder.schema';
import { ProductSchema } from 'src/products/schema/product.schema';
import { VendorSchema } from 'src/vendors/schema/vendor.schema';
import { LogisticService } from 'src/logistics/service/logistic.service';
import { ShippingService } from './service/shippment.service';
import { SingleShippingSchema } from './schema/singleshipment.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Dropshipping', schema: DropshippingSchema },
      { name: 'User', schema: UserSchema },
      { name: 'Admin', schema: AdminSchema },
      { name: 'Shipping', schema: ShippingSchema },
      { name: 'Inventory', schema: InventorySchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Cart', schema: CartSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'SingleOrder', schema: SingleOrderSchema },
      { name: 'SingleDropshipping', schema: SingleDropshippingSchema },
      { name: 'Vendor', schema: VendorSchema },
      { name: 'SingleShipping', schema: SingleShippingSchema },
    ]),
    UserModule,
    VendorsModule,
    TransactionModule,
    CartModule,
    AdminModule,
    PaymentModule,
    SubscriptionModule,
  ],
  exports: [],
  controllers: [ShippingController],
  providers: [
    HelpersService,
    PaymentService,
    OrdersService,
    LogisticService,
    ShippingService,
  ],
})
export class ShippingModule {}

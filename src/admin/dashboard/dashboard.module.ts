import { Module } from '@nestjs/common';
import { DashboardService } from './service/dashboard.service';
import { DashboardController } from './controller/dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/orders/schema/order.schema';
import { User, UserSchema } from 'src/user/schema/user.schema';
import { Vendor, VendorSchema } from 'src/vendors/schema/vendor.schema';
import { AdminModule } from '../admin.module';
import {
  Dropshipping,
  DropshippingSchema,
} from 'src/dropshipping/schema/dropshipping.schema';
import {
  Subscription,
  SubscriptionSchema,
} from 'src/subscription/schema/subscription.schema';
import { Product, ProductSchema } from 'src/products/schema/product.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Vendor.name, schema: VendorSchema },
      { name: Order.name, schema: OrderSchema },
      { name: Dropshipping.name, schema: DropshippingSchema },
      { name: Subscription.name, schema: SubscriptionSchema },
      { name: Product.name, schema: ProductSchema },
    ]),
    AdminModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashBoardModule {}

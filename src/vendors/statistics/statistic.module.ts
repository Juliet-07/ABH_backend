import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from 'src/orders/schema/order.schema';
import { ProductSchema } from 'src/products/schema/product.schema';
import { VendorSchema } from '../schema/vendor.schema';
import { StatisticController } from './controller/statistics.controller';
import { StatisticService } from './service/statics.service';
import { AdminModule } from 'src/admin/admin.module';
import { VendorsModule } from '../vendors.module';
import { DropshippingstatisticService } from './service/dropshipping.stat';
import { DropshippingSchema } from 'src/dropshipping/schema/dropshipping.schema';
import { SingleOrderSchema } from 'src/orders/schema/singleOreder.schema';
import { SingleDropshippingSchema } from 'src/dropshipping/schema/singledropshipping.schema';
import { SingleShippingSchema } from 'src/shippment/schema/singleshipment.schema';
import { LogisticService } from 'src/logistics/service/logistic.service';
import { MailingService } from 'src/utils/mailing/mailing.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Vendor', schema: VendorSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Product', schema: ProductSchema },
      { name: 'Dropshipping', schema: DropshippingSchema },
      { name: 'SingleOrder', schema: SingleOrderSchema },
      { name: 'SingleDropshipping', schema: SingleDropshippingSchema },
      { name: 'SingleShipping', schema: SingleShippingSchema },
    ]),
    AdminModule,
    VendorsModule,
  ],
  exports: [StatisticService, LogisticService],
  controllers: [StatisticController],
  providers: [
    StatisticService,
    DropshippingstatisticService,
    LogisticService,
    MailingService,
  ],
})
export class StatisticModule {}

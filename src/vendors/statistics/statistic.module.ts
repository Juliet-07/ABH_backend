import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderSchema } from 'src/orders/schema/order.schema';
import { ProductSchema } from 'src/products/schema/product.schema';
import { VendorSchema } from '../schema/vendor.schema';
import { StatisticController } from './controller/statistics.controller';
import { StatisticService } from './service/statics.service';
import { AdminModule } from 'src/admin/admin.module';
import { VendorsModule } from '../vendors.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Vendor', schema: VendorSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Product', schema: ProductSchema },
    ]),
    AdminModule,
    VendorsModule
  ],
  exports: [StatisticService],
  controllers: [StatisticController],
  providers: [StatisticService],
})
export class StatisticModule {}

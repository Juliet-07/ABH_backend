import { Module } from '@nestjs/common';
import { DashboardService } from './service/dashboard.service';
import { DashboardController } from './controller/dashboard.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from 'src/orders/schema/order.schema';
import { User, UserSchema } from 'src/user/schema/user.schem';
import { Vendor, VendorSchema } from 'src/vendors/schema/vendor.schema';
import { AdminModule } from '../admin.module';





@Module({
     imports: [
          MongooseModule.forFeature([
               { name: User.name, schema: UserSchema },
               { name: Vendor.name, schema: VendorSchema },
               { name: Order.name, schema: OrderSchema },
          ]),
          AdminModule
     ],
     controllers: [DashboardController],
     providers: [DashboardService],
     exports: [DashboardService],
})
export class DashBoardModule { }
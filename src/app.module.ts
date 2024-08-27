import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UtilsModule } from './utils/utils.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './utils/interceptors/response/response.interceptor';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { RatingsModule } from './ratings/ratings.module';
import { VendorsModule } from './vendors/vendors.module';
import { CategoryModule } from './category/category.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { HydrogenpayService } from './services/hydrogenpay/hydrogenpay.service';
import { HelpersService } from './utils/helpers/helpers.service';
import { RedisModule } from './redis/redis.module';
import { NotificationModule } from './notification/notification.module';
import { TransactionModule } from './transaction/transaction.module';
import { MongooseModule } from '@nestjs/mongoose';
import { SubscriptionModule } from './subscription/subscription.module';
import { DashBoardModule } from './admin/dashboard/dashboard.module';
import { StatisticModule } from './vendors/statistics/statistic.module';
//import { PaymentModule } from './payment/payment.module';



@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TransactionModule,
    UserModule,
    AdminModule,
    ProductsModule,
    RatingsModule,
    VendorsModule,
    MongooseModule.forRoot(process.env.MONGO_URI),

    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '21600s' },
    }),
    UtilsModule,
    CategoryModule,
    OrdersModule,
    CartModule,
    RedisModule,
    NotificationModule,
    SubscriptionModule,
    DashBoardModule,
    StatisticModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    
    HelpersService,
    // { provide: APP_GUARD, useClass: AdminAuthGuard },
    // { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: VendorGuard }
  ],
})
export class AppModule { }

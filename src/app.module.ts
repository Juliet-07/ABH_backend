import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TransactionModule } from './transaction/transaction.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UtilsModule } from './utils/utils.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './utils/interceptors/response/response.interceptor';
import { JwtModule } from '@nestjs/jwt';
import { AdminModule } from './admin/admin.module';
import { ProductsModule } from './products/products.module';
import { RatingsModule } from './ratings/ratings.module';
import { VendorsModule } from './vendors/vendors.module';
import { AdminAuthGuard } from './auth/admin-auth/admin-auth.guard';
import { AuthGuard } from './auth/auth.guard';
import { VendorGuard } from './auth/vendor-guard/vendor.guard';
import { CategoryModule } from './category/category.module';
import { OrdersModule } from './orders/orders.module';
import { CartModule } from './cart/cart.module';
import { HydrogenpayService } from './services/hydrogenpay/hydrogenpay.service';
import { HelpersService } from './utils/helpers/helpers.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // TransactionModule,
    UserModule,
    AdminModule,
    ProductsModule,
    RatingsModule,
    VendorsModule,
    TypeOrmModule.forRoot({
      "type": "postgres",
      "host": process.env.PG_HOST as string,
      "port": parseInt(process.env.DB_PORT, 10) || 5432,
      "username": process.env.POSTGRES_USER as string,
      "password": process.env.POSTGRES_PASSWORD as string,
      "database": process.env.POSTGRES_DB as string,
      "entities": [
        "dist/**/*.entity{.ts,.js}"
      ],
      "ssl": false,
      "synchronize": true
    }),
    CacheModule.register({
      isGlobal: true,
      isDebug: true,
      store: redisStore,
      url: process.env.REDIS_URL as string,
      // host: process.env.REDIS_HOST,
      // port: process.env.REDIS_PORT,
      // username: process.env.REDIS_USERNAME,
      // password: process.env.REDIS_PASSWORD,
      ttl: 300, // cache TTL in secondss
      no_ready_check: true
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '21600s' },
    }),
    UtilsModule,
    CategoryModule,
    OrdersModule,
    CartModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    HydrogenpayService,
    HelpersService,
    // { provide: APP_GUARD, useClass: AdminAuthGuard },
    // { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: VendorGuard }
  ],
})
export class AppModule { }

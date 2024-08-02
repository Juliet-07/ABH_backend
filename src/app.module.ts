import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
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
import { Vendor } from './vendors/entities/vendor.entity';
import { Category } from './category/entities/category.entity';
import { User } from './user/entities/user.entity';
import { Admin } from './admin/entities/admin.entity';
import { Product } from './products/entities/product.entity';
import { Cart } from './cart/entities/cart.entity';
import { Rating } from './ratings/entities/rating.entity';
import { Order } from './orders/entities/order.entity';
import { Notification } from './notification/entity/notification.entity';
import { Transaction } from './transaction/entities/transaction.entity';

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
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST as string,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER as string,
      password: process.env.POSTGRES_PASSWORD as string,
      database: process.env.POSTGRES_DB as string,
      entities: [Category, Vendor, User, Admin, Product, Cart, Rating, Order, Notification, Transaction],
      ssl: true,
      synchronize: false,  // Ensure this is false for production
      migrations: [__dirname + '/../migrations/*{.ts,.js}'],
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
    RedisModule,
    NotificationModule,

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

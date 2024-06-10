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
import { FileUploadService } from './services/file-upload/file-upload.service';
import { CategoryModule } from './category/category.module';

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
      "host": process.env.POSTGRES_URI,
      // "port": Number(process.env.POSTGRES_PORT),
      "username": process.env.POSTGRES_USER,
      "password": process.env.POSTGRES_PASSWORD,
      "database": process.env.POSTGRES_DB,
      "entities": [
        "dist/**/*.entity{.ts,.js}"
      ],
      "ssl": true,
      "synchronize": true
    }),
    CacheModule.register({
      isGlobal: true,
      isDebug: true,
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      username: process.env.REDIS_USERNAME,
      password: process.env.REDIS_PASSWORD,
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
   
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    FileUploadService,
    // { provide: APP_GUARD, useClass: AdminAuthGuard },
    // { provide: APP_GUARD, useClass: AuthGuard },
    // { provide: APP_GUARD, useClass: VendorGuard }
  ],
})
export class AppModule { }

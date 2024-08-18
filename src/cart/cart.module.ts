import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UserModule } from '../user/user.module';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from './schema/cart.schema';
import { ProductSchema } from 'src/products/schema/product.schema';
import { GIGLogisticsService } from 'src/services/logistic/gig-logistics.service';
import { GIGLogisticsAuthService } from 'src/services/logistic/gig-logistics-auth.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema },
  { name: 'Product', schema: ProductSchema }
  ]), UserModule],
  exports: [CartService, GIGLogisticsService],
  controllers: [CartController],
  providers: [CartService, HelpersService, GIGLogisticsService, GIGLogisticsAuthService]
})
export class CartModule { }

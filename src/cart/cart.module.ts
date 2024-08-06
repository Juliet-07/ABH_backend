import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { UserModule } from '../user/user.module';
import { HelpersService } from '../utils/helpers/helpers.service';
import { MongooseModule } from '@nestjs/mongoose';
import { CartSchema } from './schema/cart.schema';
import { ProductSchema } from 'src/products/schema/product.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Cart', schema: CartSchema },
    { name: 'Product', schema: ProductSchema }
  ]), UserModule],
  exports: [CartService],
  controllers: [CartController],
  providers: [CartService, HelpersService]
})
export class CartModule {}

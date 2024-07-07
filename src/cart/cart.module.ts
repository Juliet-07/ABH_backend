import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { Cart } from './entities/cart.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../products/entities/product.entity';
import { UserModule } from '../user/user.module';
import { HelpersService } from '../utils/helpers/helpers.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product]), UserModule],
  exports: [CartService],
  controllers: [CartController],
  providers: [CartService, HelpersService]
})
export class CartModule {}

import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { VendorsModule } from '../vendors/vendors.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), VendorsModule],
  controllers: [ProductsController],
  providers: [ProductsService, HelpersService]
})
export class ProductsModule {}

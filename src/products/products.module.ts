import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { VendorsModule } from '../vendors/vendors.module';
import { AdminModule } from '../admin/admin.module';
import { CategoryModule } from '../category/category.module';
import { Vendor } from '../vendors/entities/vendor.entity';
import { Cart } from '../cart/entities/cart.entity';
import { AzureService } from 'src/utils/uploader/azure';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Vendor, Cart]), VendorsModule, AdminModule, CategoryModule],
  exports: [ProductsService],
  controllers: [ProductsController],
  providers: [ProductsService, HelpersService, AzureService]
})
export class ProductsModule {}

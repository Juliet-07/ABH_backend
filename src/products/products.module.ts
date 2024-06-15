import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { VendorsModule } from '../vendors/vendors.module';
import { FileUploadService } from '../services/file-upload/file-upload.service';
import { AdminModule } from '../admin/admin.module';
import { CategoryModule } from '../category/category.module';
import { Vendor } from '../vendors/entities/vendor.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Vendor]), VendorsModule, AdminModule, CategoryModule],
  exports: [ProductsService],
  controllers: [ProductsController],
  providers: [ProductsService, HelpersService, FileUploadService]
})
export class ProductsModule {}

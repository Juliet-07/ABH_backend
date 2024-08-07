import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { HelpersService } from '../utils/helpers/helpers.service';
import { VendorsModule } from '../vendors/vendors.module';
import { AdminModule } from '../admin/admin.module';
import { CategoryModule } from '../category/category.module';
import { AzureService } from 'src/utils/uploader/azure';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductSchema } from './schema/product.schema';
import { VendorSchema } from 'src/vendors/schema/vendor.schema';
import { AdminSchema } from 'src/admin/schema/admin.schema';
import { MailingService } from 'src/utils/mailing/mailing.service';

@Module({
  imports: [MongooseModule.forFeature([
    { name: 'Product', schema: ProductSchema },
    { name: 'Vendor', schema: VendorSchema },
    { name: 'Admin', schema: AdminSchema }

  ]),
   VendorsModule, AdminModule, CategoryModule],
  exports: [ProductsService],
  controllers: [ProductsController],
  providers: [ProductsService, HelpersService, AzureService, MailingService]
})
export class ProductsModule {}

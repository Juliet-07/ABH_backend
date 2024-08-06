import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { AdminModule } from '../admin/admin.module';
import { AzureService } from 'src/utils/uploader/azure';
import { MongooseModule } from '@nestjs/mongoose';
import { CategorySchema } from './schema/category.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Category', schema: CategorySchema },]), AdminModule],
  exports: [CategoryService],
  controllers: [CategoryController],
  providers: [CategoryService, AzureService],
})
export class CategoryModule {}

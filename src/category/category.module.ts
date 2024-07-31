import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { AdminModule } from '../admin/admin.module';
import { AzureService } from 'src/utils/uploader/azure';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), AdminModule],
  exports: [CategoryService],
  controllers: [CategoryController],
  providers: [CategoryService, AzureService],
})
export class CategoryModule {}

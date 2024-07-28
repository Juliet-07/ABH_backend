import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Put,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { Subcategory } from './entities/subcategory.entity';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  create(@Body() createCategoryDto: CreateCategoryDto): Promise<Category> {
    return this.categoryService.create(createCategoryDto);
  }

  @UseGuards(AdminAuthGuard)
  @Post('/subcategory')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  createSubcategory(
    @Body() createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<Subcategory> {
    return this.categoryService.createSubcategory(createSubcategoryDto);
  }

  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Category>> {
    return this.categoryService.findAll(query);
  }

  @Get('/subcategory')
  findAllSubcategory(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Subcategory>> {
    return this.categoryService.findAllSubcategory(query);
  }

  @Put(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Put('/subcategory/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  updateSubcategory(
    @Param('id') id: string,
    @Body() updatesubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.categoryService.updateSubcategory(id, updatesubcategoryDto);
  }

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  patch(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Put('/subcategory/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  patchSubcategory(
    @Param('id') id: string,
    @Body() updatesubcategoryDto: UpdateSubcategoryDto,
  ) {
    return this.categoryService.updateSubcategory(id, updatesubcategoryDto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Delete('/subcategory/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  removeSubcategory(@Param('id') id: string) {
    return this.categoryService.removeSubcategory(id);
  }
}

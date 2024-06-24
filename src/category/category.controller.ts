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

  // @UseGuards(AdminAuthGuard)
  @Get()
  // @ApiBearerAuth('JWT-auth')
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Category>> {
    return this.categoryService.findAll(query);
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

  @Patch(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  patch(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoryService.update(id, updateCategoryDto);
  }

  @Delete(':id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}

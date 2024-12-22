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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import mongoose from 'mongoose';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @UseGuards(AdminAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    image;
    if (!image) {
      throw new BadRequestException('Image file is required');
    }

    return this.categoryService.create(createCategoryDto, image);
  }

  // @Get()
  // async findAll(
  //   @Query('page') page = 1,
  //   @Query('limit') limit = 10
  // ) {

  //   // Convert query parameters to numbers
  //   const pageNumber = Number(page);
  //   const limitNumber = Number(limit);
  //   return await this.categoryService.findAll(pageNumber, limitNumber);
  // }

  // REMOVED PAGINATION
  @Get()
  async findAll() {
    return await this.categoryService.findAll();
  }

  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: mongoose.Types.ObjectId) {
    return await this.categoryService.findOne(id);
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

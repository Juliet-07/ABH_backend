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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureService } from 'src/utils/uploader/azure';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly azureService: AzureService
  ) { }

  @UseGuards(AdminAuthGuard)
  @Post()
  @ApiBearerAuth('JWT-auth')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
  ) {
    return await this.categoryService.create(createCategoryDto);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('upload/:categoryId')
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Param('categoryId') categoryId: string, // Extract categoryId from the URL
    @UploadedFile() image: Express.Multer.File,
  ): Promise<Category> {
    try {
      // Upload the image to Azure Blob Storage
      const uploadedImageUrl = await this.azureService.uploadFileToBlobStorage(image);

      if (!uploadedImageUrl) {
        throw new BadRequestException('Failed to upload image to Azure Blob Storage');
      }

      // Call the service method to update the category
      const updatedCategory = await this.categoryService.uploadImage(categoryId, uploadedImageUrl);

      return updatedCategory;
    } catch (error) {
      // Log and throw the error
      throw new BadRequestException(error.message);
    }

  }



  @Get()
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Category>> {
    return this.categoryService.findAll(query);
  }


  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
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

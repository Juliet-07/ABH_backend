import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFiles,
  Req,
  Put,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Product } from './entities/product.entity';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ProductStatusEnums } from '../constants';
import { ManageProductDto } from './dto/manage-product.dto';

const pngFileFilter = (req, file, callback) => {
  if (!['image/jpg', 'image/jpeg', 'image/png'].includes(file.mimetype)) {
    req.fileValidationError =
      'Invalid file type, pls upload either a Jpg, Jpeg or Png';
    return callback(
      new Error('Invalid file type, pls upload either a Jpg, Jpeg or Png'),
      false,
    );
  }

  return callback(null, true);
};

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(VendorGuard)
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    // FilesInterceptor('product_images', 20, {
    //   fileFilter: pngFileFilter,
    // }),
    // FileInterceptor('featured_image', {
    //   fileFilter: pngFileFilter,
    // })
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ])
  )
  create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
    @UploadedFiles() files: { product_images?: Express.Multer.File[], featured_image?: Express.Multer.File[] },
    // @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.create(createProductDto, req.vendor, files);
  }

  // For Admins
  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  findAllForAdmin(
    @Paginate() query: PaginateQuery,
  ): Promise<Paginated<Product>> {
    return this.productsService.findAll(query);
  }

  // For Vendors
  @UseGuards(VendorGuard)
  @Get('/me')
  @ApiBearerAuth('JWT-auth')
  findAllForVendors(
    @Paginate() query: PaginateQuery,
    @Req() req,
  ): Promise<Paginated<Product>> {
    query.filter = { ...query.filter, ...{ vendorId: req.vendor.id } };
    return this.productsService.findAll(query);
  }

  // For Users
  @Get('/all')
  findAll(@Paginate() query: PaginateQuery): Promise<Paginated<Product>> {
    query.filter = {
      ...query.filter,
      ...{ status: ProductStatusEnums.APPROVED },
    };
    return this.productsService.findAll(query);
  }

  @Get('top-products')
  fetchTopProducts() {
    return this.productsService.fetchTopProducts();
  }

  // Manage Product Status
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('manage-product-status/:id')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  manageVendorRegistration(
    @Body() manageProductDto: ManageProductDto,
    @Param('id') id: string,
  ): Promise<string> {
    return this.productsService.manageProductStatus(manageProductDto, id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}

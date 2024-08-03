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
  BadRequestException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Product } from './entities/product.entity';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ProductStatusEnums } from '../constants';
import { ManageProductDto } from './dto/manage-product.dto';
import { AzureService } from 'src/utils/uploader/azure';



@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly azureService: AzureService,
  ) { }



  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ])
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
    @UploadedFiles() files: { product_images?: Express.Multer.File[], featured_image?: Express.Multer.File[] }
  ) {
    console.log('Files:', files);

    const vendor = req.vendor;
    if (!files.product_images) {
      throw new BadRequestException('No product images uploaded');
    }

    return this.productsService.create(
      createProductDto,
      vendor,
      files.product_images || [],
      files.featured_image?.[0] || null,

    );
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

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.productsService.findOneProduct(id);
  }

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':productId')
  remove(@Param('productId') productId: string) {
    return this.productsService.remove(productId);
  }
}

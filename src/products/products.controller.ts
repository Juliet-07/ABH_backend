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
  Put,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ProductStatusEnums } from '../constants';
import { ManageProductDto } from './dto/manage-product.dto';
import { CreateWholeSaleProductDto } from './dto/wholesale-product.dto';
import { SampleProductDto } from './dto/sample-product.dto';



@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,

  ) { }



  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('retail')
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
    @UploadedFiles() files: { product_images: Express.Multer.File[], featured_image: Express.Multer.File[] }
  ) {
    
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

  @UseGuards(VendorGuard)
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('wholesale')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ])
  )
  async AddWholesaleProduct(
    @Body() payload: CreateWholeSaleProductDto,
    @Request() req,
    @UploadedFiles() files: { product_images: Express.Multer.File[], featured_image: Express.Multer.File[] }
  ) {
    console.log('Files:', files);

    const vendor = req.vendor;
    if (!files.product_images) {
      throw new BadRequestException('No product images uploaded');
    }

    return this.productsService.create(
      payload,
      vendor,
      files.product_images || [],
      files.featured_image?.[0] || null,

    );
  }


  @UseGuards(VendorGuard)
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('sample')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ])
  )
  async AddSampleProduct(
    @Body() payload: SampleProductDto,
    @Request() req,
    @UploadedFiles() files: { product_images: Express.Multer.File[], featured_image: Express.Multer.File[] }
  ) {
    console.log('Files:', files);

    const vendor = req.vendor;
    if (!files.product_images) {
      throw new BadRequestException('No product images uploaded');
    }

    return this.productsService.create(
      payload,
      vendor,
      files.product_images || [],
      files.featured_image?.[0] || null,

    );
  }



  // For Admins
  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  async findAllForAdmin(
    @Query('status') status: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {

    const filter = status ? { status } : { status: ProductStatusEnums.APPROVED };

    return await this.productsService.findAll({
      filter,
      limit,
      page
    });
  }

 

  // For Users
  @Get('/all')
  async findAll(
    @Query('status') status: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    try {
      // Apply default filter if status is not provided
      const filter = status ? { status } : { status: ProductStatusEnums.APPROVED };

      // Call the service method with pagination and filter
      return await this.productsService.findAll({
        filter,
        limit,
        page
      });
    } catch (error) {
      throw new BadRequestException('Failed to fetch products');
    }
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

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/list/retail')
  async listRetail(@Request() req): Promise<any> {
    const vendorId = req.vendor; 
    
    return this.productsService.getAllRetailProduct(vendorId);
  }


  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/list/wholesale')
  async listWholesale(@Request() req): Promise<any> {
    const vendorId = req.vendor; 
    return this.productsService.getAllWholeSaleProduct(vendorId);
  }


  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/list/sample')
  async listSample(@Request() req): Promise<any> {
    const vendorId = req.vendor; 
    return this.productsService.getAllSampleProduct(vendorId);
  }
}

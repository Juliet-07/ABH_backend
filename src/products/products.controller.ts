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
import { ManageProductDto } from './dto/manage-product.dto';
import { CreateWholeSaleProductDto } from './dto/wholesale-product.dto';
import { SampleProductDto } from './dto/sample-product.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('retail')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ]),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @Request() req,
    @UploadedFiles()
    files: {
      product_images: Express.Multer.File[];
      featured_image: Express.Multer.File[];
    },
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
  @HttpCode(HttpStatus.CREATED)
  @Post('wholesale')
  //@UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ]),
  )
  async AddWholesaleProduct(
    @Body() payload: CreateWholeSaleProductDto,
    @Request() req,
    @UploadedFiles()
    files: {
      product_images: Express.Multer.File[];
      featured_image: Express.Multer.File[];
    },
  ) {
    const vendor = req.vendor;
    if (!files.product_images) {
      throw new BadRequestException('No product images uploaded');
    }

    return this.productsService.createWholesaleProduct(
      payload,
      vendor,
      files.product_images || [],
      files.featured_image?.[0] || null,
    );
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('sample')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'product_images', maxCount: 20 },
      { name: 'featured_image', maxCount: 1 },
    ]),
  )
  async AddSampleProduct(
    @Body() payload: SampleProductDto,
    @Request() req,
    @UploadedFiles()
    files: {
      product_images: Express.Multer.File[];
      featured_image: Express.Multer.File[];
    },
  ) {
    const vendor = req.vendor;
    console.log(vendor);
    if (!files.product_images) {
      throw new BadRequestException('No product images uploaded');
    }

    return this.productsService.sampleProduct(
      payload,
      vendor,
      files.product_images || [],
      files.featured_image?.[0] || null,
    );
  }

  //For Admins
  @UseGuards(AdminAuthGuard)
  @Get('admin-all')
  @ApiBearerAuth('JWT-auth')
  async findAllProductForAdmin() {
    return await this.productsService.findAllProductForAdmin();
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  async getProductsForAdmin(@Query('status') status?: string) {
    return await this.productsService.findAllForAdmin({
      status,
    });
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/me')
  findVendorProduct(@Request() req) {
    const vendor = req.vendor;

    return this.productsService.listAllVendorProduct(vendor);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/vendor/:vendor')
  async findVendorProduct1(@Param('vendor') vendor: string) {
    return this.productsService.listAllVendorProduct(vendor);
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

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('/update/:productId')
  update(
    @Param('productId') productId: string,
    @Body() updateProductDto: UpdateProductDto,
    @Request() req,
  ) {
    const vendorId = req.vendor;
    return this.productsService.updateVendorProduct(
      productId,
      vendorId,
      updateProductDto,
    );
  }

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Delete(':productId')
  remove(@Param('productId') productId: string) {
    return this.productsService.remove(productId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Delete('/delete/:productId')
  removeForVendor(@Param('productId') productId: string, @Request() req) {
    const vendorId = req.vendor;
    return this.productsService.removeForVendor(productId, vendorId);
  }

  //for users

  @HttpCode(HttpStatus.OK)
  @Get('/list/retail')
  async listRetail(): Promise<any> {
    return this.productsService.getAllRetailProduct();
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list/wholesale')
  async listWholesale(): Promise<any> {
    return await this.productsService.getAllWholeSaleProduct();
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list/sample')
  async listSample(): Promise<any> {
    return this.productsService.getAllSampleProduct();
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list/wholesale/:productId')
  async listOneWholesaleProduct(@Param('productId') productId: string) {
    return await this.productsService.getOneWholesaleProduct(productId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list/retail/:productId')
  async listOneRetailProduct(@Param('productId') productId: string) {
    return await this.productsService.getOneRetailProduct(productId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list/sample/:productId')
  async listOneSampleProduct(@Param('productId') productId: string) {
    return await this.productsService.getOneSampleProduct(productId);
  }

  // For Users
  @HttpCode(HttpStatus.OK)
  @Get('/list/all')
  async findAll() {
    // Call the service method
    return this.productsService.findAllForUser();
  }

  @Get('category/:categoryId')
  async getProductsByCategory(@Param('categoryId') categoryId: string) {
    return this.productsService.getProductsByCategory(categoryId);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/list-one/:productId')
  async ListOne(@Param('productId') productId: string) {
    return await this.productsService.listOne(productId);
  }
}

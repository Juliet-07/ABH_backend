import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  UsePipes,
  HttpStatus,
  HttpCode,
  Query,
  Put,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { LoginResponse } from '../user/user.interface';
import { LoginVendorDto } from './dto/login-vendor.dto';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { ManageVendorDto } from './dto/manage-vendor.dto';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { AzureService } from 'src/utils/uploader/azure';
import { VendorStatusEnums } from 'src/constants';


@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(
    private readonly vendorsService: VendorsService,
    private readonly azureService: AzureService,

  ) { }

  // Create Vendor
  @Post()
  @UsePipes(new ValidationPipe())
  @UseInterceptors(FileInterceptor('cacCertificate'))
  async create(
    @Body() createVendorDto: CreateVendorDto,
    @UploadedFile() cacCertificate: Express.Multer.File,
  ) {
    if (!cacCertificate) {
      throw new BadRequestException('CAC Certificate file is required');
    }

    return this.vendorsService.create(createVendorDto, cacCertificate);

  }

  //  Vendor Login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() loginVendorDto: LoginVendorDto): Promise<LoginResponse> {
    return this.vendorsService.login(loginVendorDto);
  }

  // Request for Verification code
  @HttpCode(HttpStatus.OK)
  @Get('request-verification')
  @UsePipes(new ValidationPipe())
  requestVerification(@Query('email') email: string): Promise<void> {
    return this.vendorsService.requstVerification(email);
  }

  // Verify Vendor Account
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  @UsePipes(new ValidationPipe())
  verifyVendorAccount(@Body() verifyVendorDto: VerifyVendorDto): Promise<void> {
    return this.vendorsService.verifyVendorAccount(verifyVendorDto);
  }

  // Manage Vendor Account Status
   @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Put('manage-account-status/:id')
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  manageVendorRegistration(
    @Body() manageVendorDto: ManageVendorDto,
    @Param('id') id: string,
  ): Promise<string> {
    return this.vendorsService.manageVendorRegistration(manageVendorDto, id);
  }

  @UseGuards(VendorGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
    return req.vendors;
  }

  //@UseGuards(AdminAuthGuard)
  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('filter.status') status?: VendorStatusEnums
  ) {
    const filter = status ? { status } : undefined;
    return this.vendorsService.findAll(page, limit, filter);
  }



  @UseGuards(AdminAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.vendorsService.listOneVendor(id);
  }

  @UseGuards(VendorGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(@Param('id') id: string, @Body() updateVendorDto: UpdateVendorDto) {
    return this.vendorsService.update(+id, updateVendorDto);
  }

  @UseGuards(VendorGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.vendorsService.remove(+id);
  }

  @Patch('/block-status/:vendorId')
  async toggleBlockVendor(
    @Param('vendorId') vendorId: string,
  ): Promise<string> {
    return this.vendorsService.blockAndUnblockVendor(vendorId);
  }
}


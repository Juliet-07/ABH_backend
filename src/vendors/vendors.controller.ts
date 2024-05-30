import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ValidationPipe, UsePipes, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { VendorsService } from './vendors.service';
import { CreateVendorDto } from './dto/create-vendor.dto';
import { UpdateVendorDto } from './dto/update-vendor.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../auth/auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { LoginResponse } from '../user/user.interface';
import { LoginVendorDto } from './dto/login-vendor.dto';
import { VerifyVendorDto } from './dto/verify-vendor.dto';
import { ManageVendorDto } from './dto/manage-vendor.dto';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';

@ApiTags('Vendors')
@Controller('vendors')
export class VendorsController {
  constructor(private readonly vendorsService: VendorsService) {}

  // Create Vendor
  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createVendorDto: CreateVendorDto): Promise<void> {
    return this.vendorsService.create(createVendorDto);
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
    @Post('manage-accont-status/:id')
    @UsePipes(new ValidationPipe())
    manageVendorRegistration(@Body() manageVendorDto: ManageVendorDto, @Param('id') id: number): Promise<void> {
      return this.vendorsService.manageVendorRegistration(manageVendorDto, id);
    }

  @UseGuards(VendorGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
    return req.vendors;
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  findAll() {
    return this.vendorsService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.vendorsService.findOne(+id);
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
}

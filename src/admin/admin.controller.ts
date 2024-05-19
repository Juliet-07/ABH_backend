import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginAdminDto } from './dto/login-admin.dto';
import { LoginResponse } from './admin.interface';
import { AuthGuard } from '../auth/auth.guard';
import { AdminAuthGuard } from '../admin-auth/admin-auth.guard';
import { VerifyAdminDto } from './dto/verify-admin.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) { }

  // Create Admin
  // @UseGuards(AdminAuthGuard)
  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createAdminDto: CreateAdminDto): Promise<void> {
    return this.adminService.create(createAdminDto);
  }

  //  Admin Login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() loginAdminDto: LoginAdminDto): Promise<LoginResponse> {
    return this.adminService.login(loginAdminDto);
  }

  @UseGuards(AdminAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
    return req.admin;
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  findAll() {
    return this.adminService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.adminService.findOne(+id);
  }

  @UseGuards(AdminAuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(@Param('id') id: string, @Body() updateAdminDto: UpdateAdminDto) {
    return this.adminService.update(+id, updateAdminDto);
  }

  @UseGuards(AdminAuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.adminService.remove(+id);
  }
}

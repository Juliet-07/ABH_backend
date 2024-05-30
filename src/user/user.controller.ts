import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UsePipes, HttpCode, HttpStatus, UseGuards, Request, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponse } from './user.interface';
import { AuthGuard } from '../auth/auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { VerifyUserDto } from './dto/verify-user.dto';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  // Create User
  @Post()
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: CreateUserDto): Promise<void> {
    return this.userService.create(createUserDto);
  }

  //  User Login
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @UsePipes(new ValidationPipe())
  login(@Body() loginUserDto: LoginUserDto): Promise<LoginResponse> {
    return this.userService.login(loginUserDto);
  }

  // Request for Verification code
  @HttpCode(HttpStatus.OK)
  @Get('request-verification')
  @UsePipes(new ValidationPipe())
  requestVerification(@Query('email') email: string): Promise<void> {
    return this.userService.requstVerification(email);
  }

  // Verify User Account
  @HttpCode(HttpStatus.OK)
  @Post('verify')
  @UsePipes(new ValidationPipe())
  verifyUserAccount(@Body() verifyUserDto: VerifyUserDto): Promise<void> {
    return this.userService.verifyUserAccount(verifyUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(AdminAuthGuard)
  @Get()
  @ApiBearerAuth('JWT-auth')
  findAll() {
    return this.userService.findAll();
  }

  @UseGuards(AdminAuthGuard)
  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

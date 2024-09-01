import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  UsePipes,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { LoginResponse } from './user.interface';
import { AuthGuard } from '../auth/auth.guard';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { VerifyUserDto } from './dto/verify-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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

  @HttpCode(HttpStatus.OK)
  @Post('forget-password')
  async forgetPassword(@Body('email') email: string) {
    return await this.userService.requestForgotPasswordVerificationCode(email);
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
    // return req.user;
    return this.userService.getProfile(req.user);
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
  @Patch('update-profile')
  @ApiBearerAuth('JWT-auth')
  update(@Body() updateUserDto: UpdateUserDto, @Request() req) {
    const userId = req.user;
    return this.userService.update(userId, updateUserDto);
  }

  @Patch('reset-password')
  async ResetPasswd(
    @Body('email') email: string,
    @Body('otp') otp: string,
    @Body('newPassword') newPassword: string,
  ) {
    return await this.userService.changePassword(email, otp, newPassword);
  }

  @UseGuards(AuthGuard)
  @Patch('update-image')
  @UseInterceptors(FileInterceptor('image'))
  @ApiBearerAuth('JWT-auth')
  uploadImage(@UploadedFile() image: Express.Multer.File, @Request() req) {
    if (!image) {
      throw new BadRequestException('Image file is required');
    }
    const userId = req.user;
    return this.userService.uploadImage(userId, image);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}

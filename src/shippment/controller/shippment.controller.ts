import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ShippingService } from '../service/shippment.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateShippingDto } from '../dto/shipping.dto';

@Controller('shipping')
export class ShippingController {
  constructor(private readonly shippingService: ShippingService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  create(@Body() payload: CreateShippingDto, @Request() req) {
    const userId = req.user;
    return this.shippingService.checkoutFromInventory(payload, userId);
  }

  @Get('users')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  ListShipping(@Request() req) {
    const userId = req.user;
    return this.shippingService.listShipping(userId);
  }
}

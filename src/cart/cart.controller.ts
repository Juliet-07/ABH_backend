import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  HttpCode,
  UsePipes,
  ValidationPipe,
  Req,
  Put,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SynchronizeCartDto } from './dto/synchronize-cart.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Put('/add')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  addToCart(@Body() addToCartDto: AddToCartDto, @Req() req) {
    return this.cartService.addToCart(addToCartDto, req.user.id);
  }

  @Put('/:productId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  updateCartItem(
    @Body() updateCartDto: UpdateCartDto,
    @Param('productId') productId: string,
    @Req() req,
  ) {
    return this.cartService.updateCart(updateCartDto, productId, req.user.id);
  }

  @Post('/synchronize')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  synchronizeCart(@Body() syncCartDto: SynchronizeCartDto, @Req() req) {
    return this.cartService.synchronizeCart(syncCartDto, req.user.id);
  }

  @Get('/validate')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  validateCart(@Req() req) {
    return this.cartService.validateCart(req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  findOne(@Req() req) {
    return this.cartService.findOne(req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto) {
    return this.cartService.update(+id, updateCartDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cartService.remove(+id);
  }
}

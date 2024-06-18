import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpStatus, HttpCode, UsePipes, ValidationPipe, Req, Put } from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { AddToCartDto } from './dto/add-to-cart.dto';

@Controller('cart')
export class CartController {
  constructor(
    private readonly cartService: CartService) {}

  @Put('/add')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  // create(@Body() createCartDto: CreateCartDto, @Req() req) {
  //   return this.cartService.create(createCartDto, req.user.id);
  // }

  addToCart(@Body() addToCartDto: AddToCartDto, @Req() req) {
    return this.cartService.addToCart(addToCartDto, req.user.id);
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

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
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SynchronizeCartDto } from './dto/synchronize-cart.dto';
import { DeliveryEstimateDto } from './dto/delivery-estimate.dto';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post('/add')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  addToCart(
    @Body() syncCartDto: SynchronizeCartDto,
    @Request() req,
  ) {
    const userId = req.user
    return this.cartService.addToCart(syncCartDto, userId);
  }

  @Put('/:productId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  updateCartItem(
    @Body() updateCartDto: UpdateCartDto,
    @Param('productId') productId: string,
    @Request() req,
  ) {
    const userId = req.user
    return this.cartService.updateCart(updateCartDto, productId, userId);
  }

  @Post('/synchronize')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  synchronizeCart(
    @Body() syncCartDto: SynchronizeCartDto
    , @Request() req,
  ) {

    const userId = req.user
    return this.cartService.synchronizeCart(syncCartDto, userId);
  }

  @Get('/validate')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  validateCart(@Req() req) {
    return this.cartService.validateCart(req.user.id);
  }

  @Post('/delivery-cost-estimate')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  getDeliveryEstimate(@Request() req, deliveryEstimateDto: DeliveryEstimateDto) {
    const userId = req.user
    return this.cartService.getDeliveryEstimate(userId, deliveryEstimateDto);
  }

  @Delete('/delete/:productId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  removeProductFromCart(@Request() req, @Param('productId') productId: string) {
    const userId = req.user
    return this.cartService.removeProductFromCart(userId, productId);
  }

  @Get()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  findOne(@Request() req) {
    const userId = req.user
    return this.cartService.findOne(userId);
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

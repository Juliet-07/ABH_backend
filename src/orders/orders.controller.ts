import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus, UsePipes, ValidationPipe, Req, UseInterceptors, Put } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';
import { Paginate, PaginateQuery } from 'nestjs-paginate';
import { TransactionInterceptor } from '../common/transaction.interceptor';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';
import { ConfirmTransactionStatusDto } from './dto/confirm-transaction-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @UseInterceptors(TransactionInterceptor)
  @ApiBearerAuth('JWT-auth')
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    return this.ordersService.create(createOrderDto, req.user.id);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  findAll(@Paginate() query: PaginateQuery) {
    return this.ordersService.findAll(query);
  }

  @Get('vendor/me')
  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  fetchVendorOrders(@Req() req, @Paginate() query: PaginateQuery) {
    return this.ordersService.fetchMyOrders(req.vendor.id, query, 'vendor');
  }

  @Get('user/me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  fetchUserOrders(@Req() req, @Paginate() query: PaginateQuery) {
    return this.ordersService.fetchMyOrders(req.user.id, query, 'user');
  }

  @Put('status/:id')
  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  updateOrderStatus(@Param('id') id: string, @Req() req, @Body() updateOrderStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateOrderStatus(id, req.vendor.id, updateOrderStatusDto);
  }

  @Post('confirm/:transactionId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  confirmTransactionStatus(@Param('transactionId') transactionId: string, @Req() req, @Body() confirmTransactionStatusDto: ConfirmTransactionStatusDto) {
    return this.ordersService.confirmTransactionStatus(transactionId, req.user.id, confirmTransactionStatusDto);
  }

  @Get(':orderId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  TrackOrder(@Param("orderId") orderId: string) {
    return this.ordersService.trackOder(orderId)
  }


}

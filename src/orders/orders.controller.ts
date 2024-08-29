import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
  ValidationPipe,
  Req,
  Put,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '../auth/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { VendorGuard } from '../auth/vendor-guard/vendor.guard';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { AdminAuthGuard } from '../auth/admin-auth/admin-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    const userId = req.user;
    return this.ordersService.create(createOrderDto, userId);
  }

  @Get()
  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return this.ordersService.findAll(pageNumber, limitNumber);
  }

  @Get('vendor/me')
  @UseGuards(VendorGuard) // Ensure the guard is correctly implemented
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  async fetchVendorOrders(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      // Ensure limit and page are numbers
      const pageNumber = Number(page);
      const limitNumber = Number(limit);

      // Ensure page and limit are positive integers
      if (pageNumber < 1 || limitNumber < 1) {
        throw new BadRequestException(
          'Page number and limit must be greater than zero',
        );
      }

      // Call the service method
      return await this.ordersService.fetchMyOrders(
        req.vendor.id,
        limitNumber,
        pageNumber,
        'vendorId',
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get('user/me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  async fetchUserOrders(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      // Ensure limit and page are numbers
      const pageNumber = Number(page);
      const limitNumber = Number(limit);
      const userId = req.user;

      // Ensure page and limit are positive integers
      if (pageNumber < 1 || limitNumber < 1) {
        throw new BadRequestException(
          'Page number and limit must be greater than zero',
        );
      }

      // Call the service method
      return await this.ordersService.fetchMyOrders(
        userId,
        limitNumber,
        pageNumber,
        'user',
      );
    } catch (error) {
      console.error('Error fetching user orders:', error);
      throw new BadRequestException('Failed to fetch user orders.');
    }
  }

  @Get('/:orderId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  async ListOneOrder(@Param('orderId') orderId: string, @Request() req) {
    const userId = req.user;
    return await this.ordersService.listOneOrder(orderId, userId);
  }

  @Put('status/:id')
  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  updateOrderStatus(
    @Param('id') id: string,
    @Req() req,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    return this.ordersService.updateOrderStatus(
      id,
      req.vendor.id,
      updateOrderStatusDto,
    );
  }

  // @Post('confirm/:transactionId')
  // @UseGuards(AuthGuard)
  // @HttpCode(HttpStatus.OK)
  // @UsePipes(new ValidationPipe())
  // @ApiBearerAuth('JWT-auth')
  // confirmTransactionStatus(@Param('transactionId') transactionId: string, @Req() req, @Body() confirmTransactionStatusDto: ConfirmTransactionStatusDto) {
  //   return this.ordersService.confirmTransactionStatus(transactionId, req.user.id, confirmTransactionStatusDto);
  // }

  @Get(':orderId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  TrackOrder(@Param('orderId') orderId: string) {
    return this.ordersService.trackOder(orderId);
  }
}

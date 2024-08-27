import {
  Controller,
  HttpCode,
  HttpStatus,
  Query,
  Post,
  Get,
  Request,
  UseGuards,
  Param,
  Patch,
  Body,
} from '@nestjs/common';
import { StatisticService } from '../service/statics.service';
import { VendorGuard } from 'src/auth/vendor-guard/vendor.guard';
import { OrderStatusEnum } from 'src/constants';

@Controller('vendors-dashboard')
export class StatisticController {
  constructor(private readonly statisticService: StatisticService) {}

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/my-orders')
  async AllOrders(@Request() req) {
    const vendorId = req.vendor;

    return this.statisticService.getOrdersByVendorId(vendorId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('accept-orders')
  async acceptOrder(@Request() req, @Param('orderId') orderId: string) {
    const vendorId = req.vendor;

    return this.statisticService.acceptOrder(orderId, vendorId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('orders-status')
  async updateOrderStatus(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() payload: OrderStatusEnum,
  ) {
    const vendorId = req.vendor;

    return this.statisticService.updateOrderStatus(orderId, vendorId, payload);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('out-of-stocks')
  async OutOfStock(@Request() req) {
    const vendorId = req.vendor;
    return this.statisticService.outOfstock(vendorId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('total-sales')
  async totalSalesForVendor(@Request() req) {
    const vendorId = req.vendor;
    return this.statisticService.totalSalesForVendor(vendorId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('total-product')
  async TotalProduct(@Request() req) {
    const vendorId = req.vendor;
    return this.statisticService.totalProduct(vendorId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('revenue')
  async getMonthlyOrdersAndRevenue(@Request() req) {
    const vendorId = req.vendor;
    return this.statisticService.getMonthlyOrdersAndRevenueForVendor(vendorId);
  }
  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('orders')
  async orderStatus(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const vendorId = req.vendor;
    return this.statisticService.orderStatus({
      status,
      limit,
      page,
      vendorId,
    });
  }
}

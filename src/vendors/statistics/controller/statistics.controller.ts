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
  Put,
} from '@nestjs/common';
import { StatisticService } from '../service/statics.service';
import { VendorGuard } from 'src/auth/vendor-guard/vendor.guard';
import { UpdateOrderStatusDto1 } from 'src/orders/dto/update-order-status.dto';
import { OrderStatusEnum } from 'src/constants';
import { DropshippingstatisticService } from '../service/dropshipping.stat';

@Controller('vendors-dashboard')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly dropshippingstatisticService: DropshippingstatisticService,
  ) {}
  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/my-orders')
  async AllOrders(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const vendorId = req.vendor;

    // Call the service method with pagination parameters
    return this.statisticService.getOrdersByVendorId(vendorId, page, limit);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/track-orders/:orderId')
  async TrackOrders(@Param('orderId') orderId: string, @Request() req) {
    const vendorId = req.vendor;

    return this.statisticService.trackOrder(orderId, vendorId);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Put('accept-orders/:orderId')
  async acceptOrder(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() payload: UpdateOrderStatusDto1,
  ) {
    const vendorId = req.vendor;

    return this.statisticService.acceptOrder(orderId, vendorId, payload);
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Post('update-orders-status/:orderId')
  async updateOrderStatus(
    @Request() req,
    @Param('orderId') orderId: string,
    @Body() payload: UpdateOrderStatusDto1,
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
    @Query('status') deliveryStatus?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const vendorId = req.vendor;

    // Validate and convert deliveryStatus to enum
    let validatedStatus: OrderStatusEnum | undefined;
    if (
      deliveryStatus &&
      Object.values(OrderStatusEnum).includes(deliveryStatus as OrderStatusEnum)
    ) {
      validatedStatus = deliveryStatus as OrderStatusEnum;
    }

    // Convert limit and page to numbers
    const numericLimit = limit ? parseInt(limit.toString(), 10) : undefined;
    const numericPage = page ? parseInt(page.toString(), 10) : undefined;

    return this.statisticService.orderStatus({
      deliveryStatus: validatedStatus,
      limit: numericLimit,
      page: numericPage,
      vendorId,
    });
  }

  // DROPSHIPPING END HTTP

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/my-dropshipping')
  async AllDropshipping(
    @Request() req,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    const vendorId = req.vendor;

    return this.dropshippingstatisticService.getDropshippingByVendorId(
      vendorId,
      page,
      limit,
    );
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('/track-dropshipping/:dropshippingId')
  async TrackDropshipping(
    @Param('dropshippingId') dropshippingId: string,
    @Request() req,
  ) {
    const vendorId = req.vendor;

    return this.dropshippingstatisticService.trackDropshipping(
      dropshippingId,
      vendorId,
    );
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('accept-dropshipping/:dropshippingId')
  async acceptDropshipping(
    @Request() req,
    @Param('dropshippingId') dropshippingId: string,
    @Body() payload: UpdateOrderStatusDto1,
  ) {
    const vendorId = req.vendor;

    return this.dropshippingstatisticService.acceptDropshipping(
      dropshippingId,
      vendorId,
      payload,
    );
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Post('update-dropshipping-status/:dropshippingId')
  async updateDropshippingStatus(
    @Request() req,
    @Param('dropshippingId') dropshippingId: string,
    @Body() payload: UpdateOrderStatusDto1,
  ) {
    const vendorId = req.vendor;

    return this.dropshippingstatisticService.updatedropshippingStatus(
      dropshippingId,
      vendorId,
      payload,
    );
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('dropshipping-total-sales')
  async totalSalesForDropshippingVendor(@Request() req) {
    const vendorId = req.vendor;
    return this.dropshippingstatisticService.totalSalesForDropshipping(
      vendorId,
    );
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('dropshipping')
  async GetDropshippingStatus(
    @Request() req: any,
    @Query('status') deliveryStatus?: string,
    @Query('limit') limit?: number,
    @Query('page') page?: number,
  ) {
    const vendorId = req.vendor;

    // Validate and convert deliveryStatus to enum
    let validatedStatus: OrderStatusEnum | undefined;
    if (
      deliveryStatus &&
      Object.values(OrderStatusEnum).includes(deliveryStatus as OrderStatusEnum)
    ) {
      validatedStatus = deliveryStatus as OrderStatusEnum;
    }

    // Convert limit and page to numbers
    const numericLimit = limit ? parseInt(limit.toString(), 10) : undefined;
    const numericPage = page ? parseInt(page.toString(), 10) : undefined;

    return this.dropshippingstatisticService.dropshippingStatus({
      deliveryStatus: validatedStatus,
      limit: numericLimit,
      page: numericPage,
      vendorId,
    });
  }

  @UseGuards(VendorGuard)
  @HttpCode(HttpStatus.OK)
  @Get('dropshipping-revenue')
  async getMonthlyDropshippingAndRevenue(@Request() req) {
    const vendorId = req.vendor;
    return this.dropshippingstatisticService.getMonthlyDropshippingAndRevenueForVendor(
      vendorId,
    );
  }
}

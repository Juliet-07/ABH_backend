import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DashboardService } from '../service/dashboard.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from 'src/auth/admin-auth/admin-auth.guard';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('statistic')
  async statistic() {
    return await this.dashboardService.dashBoard();
  }

  @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('orders')
  async findAllOrder(@Query('page') page = 1, @Query('limit') limit = 10) {
    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    return await this.dashboardService.findAll(pageNumber, limitNumber);
  }

  @UseGuards(AdminAuthGuard)
  @Get('orders-track/:orderId')
  // @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  TrackOrder(@Param('orderId') orderId: string) {
    return this.dashboardService.trackOder(orderId);
  }

  @UseGuards(AdminAuthGuard)
  @Get('orders/:orderId')
  // @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  ListOneOrder(@Param('orderId') orderId: string) {
    return this.dashboardService.findOneOrder(orderId);
  }
  // @UseGuards(AdminAuthGuard)
  @Get('drop-shipping')
  @ApiBearerAuth('JWT-auth')
  async findAllProductForAdmin(
    @Query('limit') limit?: number,
    @Query('page') page?: number,
    @Query('status') status?: string,
  ) {
    return await this.dashboardService.listAllDropshipping({
      limit,
      page,
      status,
    });
  }

  // @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('subscribers')
  async ListAllSubScribers() {
    return await this.dashboardService.listAllSubscribers();
  }

  // @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('data-subscribers')
  async SubScribersData() {
    return await this.dashboardService.subscribeData();
  }

  // @UseGuards(AdminAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('products/:vendor')
  async ListAllVendorsProduct(@Param('vendor') vendor: string) {
    return await this.dashboardService.listAllVendorsProduct(vendor);
  }
}

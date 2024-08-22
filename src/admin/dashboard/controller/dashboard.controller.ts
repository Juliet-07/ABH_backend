import { Controller, Get, HttpCode, HttpStatus, Param, Query } from "@nestjs/common";
import { DashboardService } from "../service/dashboard.service";
import { ApiBearerAuth } from "@nestjs/swagger";






@Controller('dashboard')
export class DashboardController {
     constructor(
          private readonly dashboardService: DashboardService,

     ) { }


     @HttpCode(HttpStatus.OK)
     @Get('statistic')
     async statistic() {
          return await this.dashboardService.dashBoard()
     }




     @HttpCode(HttpStatus.OK)
     @Get('orders')
     async findAllOrder(
          @Query('page') page = 1,
          @Query('limit') limit = 10
     ) {

          const pageNumber = Number(page);
          const limitNumber = Number(limit);

          return await this.dashboardService.findAll(pageNumber, limitNumber)
     }


     @Get('orders-track/:orderId')
     // @UseGuards(AuthGuard)
     @HttpCode(HttpStatus.OK)
     @ApiBearerAuth('JWT-auth')
     TrackOrder(@Param("orderId") orderId: string) {
          return this.dashboardService.trackOder(orderId)
     }



     @Get('orders/:orderId')
     // @UseGuards(AuthGuard)
     @HttpCode(HttpStatus.OK)
     @ApiBearerAuth('JWT-auth')
     ListOneOrder(@Param("orderId") orderId: string) {
          return this.dashboardService.findOneOrder(orderId)
     }


}
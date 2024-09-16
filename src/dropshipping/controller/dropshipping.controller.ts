import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
  Request,
  Query,
  Get,
  Param,
} from '@nestjs/common';
import { DropshippingService } from '../service/dropshipping.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/auth/auth.guard';
import { CreateDropShippingDto } from '../dto/dropshipping.dto';

@Controller('dropshipping')
export class DropshippingController {
  constructor(private readonly dropshippingService: DropshippingService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  create(@Body() payload: CreateDropShippingDto, @Request() req) {
    const userId = req.user;
    return this.dropshippingService.create(payload, userId);
  }

  @Get('list')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  ListDropshipping(@Request() req) {
    const userId = req.user;
    return this.dropshippingService.listDropshipping(userId);
  }

  @Get('inventories/:inventoryId')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  ListOneInventory(@Param('inventoryId') inventoryId: string, @Request() req) {
    const userId = req.user;
    return this.dropshippingService.listOneInventory(inventoryId, userId);
  }

  @Get('my-inventories')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe())
  @ApiBearerAuth('JWT-auth')
  MyInventories(@Request() req) {
    const userId = req.user;
    return this.dropshippingService.myInventories(userId);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async handleCallbackSub(@Body('TransactionRef') transactionRef: string) {
    return await this.dropshippingService.verifyDropshippingTransaction(
      transactionRef,
    );
  }

  @Get('verify')
  async verifyPayment(@Query('TransactionRef') TransactionRef: string) {
    return await this.dropshippingService.verifyDropshippingTransaction(
      TransactionRef,
    );
  }
}

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
  BadRequestException,
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

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async handleCallbackSub(@Body('TransactionRef') transactionRef: string) {
    return await this.dropshippingService.verifyDropshippingTransaction(
      transactionRef,
    );
  }
}

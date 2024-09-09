import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { PaymentService } from '../service/payments.service';
import { CreatePaymentDto, CreatePayStackPaymentDto } from '../dto/initiat.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('hydrogenpay/initialize')
  @HttpCode(HttpStatus.CREATED)
  pay(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentService.createPayment(createPaymentDto);
  }

  @Post('order-verify')
  @HttpCode(HttpStatus.OK)
  async handleCallbackOrder(@Body('TransactionRef') transactionRef: string) {
    try {
      return await this.paymentService.verifyOrderTransaction(transactionRef);
    } catch (error) {
      throw new BadRequestException('Transaction verification failed');
    }
  }

  @Get('verify')
  async verifyPayment(@Query('TransactionRef') TransactionRef: string) {
    return await this.paymentService.verifyOrderTransaction(TransactionRef);
  }

  @Post('subscription-verify')
  @HttpCode(HttpStatus.OK)
  async handleCallbackSub(@Body('TransactionRef') transactionRef: string) {
    try {
      return await this.paymentService.verifySubscriptionTransaction(
        transactionRef,
      );
    } catch (error) {
      throw new BadRequestException('Transaction verification failed');
    }
  }

  @Post('/paystack/initialize')
  async initializePayment(@Body() createPaymentDto: CreatePayStackPaymentDto) {
    return this.paymentService.initializePayment(createPaymentDto);
  }
}

import {
  Controller,
  Post,
  Body,
  HttpCode,
  Logger,
  HttpStatus,
  Get,
  Query,
} from '@nestjs/common';
import { WebhookService } from '../service/webhook.service';
import { DropshippingService } from 'src/dropshipping/service/dropshipping.service';
import { PaymentService } from 'src/payment/service/payments.service';
import { ShippingService } from 'src/shippment/service/shippment.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(
    private readonly webhookService: WebhookService,
    private readonly paymentService: PaymentService,
    private readonly shippingService: ShippingService,
    private readonly dropshippingService: DropshippingService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    const transactionRef = body.transactionRef || body.TransactionRef;

    // Check if transactionRef is available
    if (!transactionRef) {
      this.logger.error('TransactionRef is missing in the webhook payload');
      return { message: 'TransactionRef is missing' };
    }

    // Validate the transaction status
    const status = body.status || body.transactionStatus;
    if (status !== 'Paid') {
      this.logger.warn(`Transaction is not 'Paid': ${status}`);
      return { message: `Transaction is not Paid: ${status}` };
    }
    try {
      // Process all promises concurrently
      await Promise.all([
        this.dropshippingService.updateDropshippingPayment(transactionRef),
        this.shippingService.updateDropshippingPayment(transactionRef),
        this.paymentService.verifyOrderTransaction(transactionRef),
      ]);

      this.logger.log('All webhook functions processed successfully');
    } catch (error) {
      // If any of the promises fail, log the error
      this.logger.error(`Error processing webhook: ${error.message}`);
    }
  }

  @Get('verify')
  async verifyPayment(@Query('TransactionRef') TransactionRef: string) {
    try {
      await Promise.all([
        this.dropshippingService.updateDropshippingPayment(TransactionRef),
        this.shippingService.updateDropshippingPayment(TransactionRef),
        this.paymentService.verifyOrderTransaction(TransactionRef),
      ]);
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
    }
  }
}

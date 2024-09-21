import {
  Controller,
  Post,
  Body,
  HttpCode,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { WebhookService } from '../service/webhook.service';

@Controller('webhook')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() body: any) {
    const { transactionRef } = body;
    this.logger.log(`Received webhook event: ${transactionRef}`);

    try {
      await this.webhookService.handleDropshippingVerification(body);
      await this.webhookService.handlePaymentVerification(body);
      await this.webhookService.handleShippingVerification(body);

      this.logger.log('All webhook functions processed successfully');
    } catch (error) {
      this.logger.error(`Error processing webhook: ${error.message}`);
    }
  }
}

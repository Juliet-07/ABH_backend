import { Injectable, Logger } from '@nestjs/common';
import { DropshippingService } from 'src/dropshipping/service/dropshipping.service';
import { PaymentService } from 'src/payment/service/payments.service';
import { ShippingService } from 'src/shippment/service/shippment.service';

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly paymentService: PaymentService,
    private readonly shippingService: ShippingService,
    private readonly dropshippingService: DropshippingService,
  ) {}

  async handleShippingVerification(data: any) {
    await this.shippingService.updateDropshippingPayment(data);
    this.logger.log('Processing dropshipping verification:', data);
  }

  async handlePaymentVerification(data: any) {
    await this.paymentService.verifyOrderTransaction(data);
    this.logger.log('Processing payment verification:', data);
  }

  async handleDropshippingVerification(data: any) {
    await this.dropshippingService.updateDropshippingPayment(data);
    this.logger.log('Processing shipping verification:', data);
  }
}

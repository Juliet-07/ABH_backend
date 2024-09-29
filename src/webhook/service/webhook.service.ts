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

  async handleShippingVerification(TransactionRef: string) {
    await this.shippingService.updateDropshippingPayment(TransactionRef);
    this.logger.log('Processing dropshipping verification:', TransactionRef);
  }

  async handlePaymentVerification(TransactionRef: string) {
    await this.paymentService.verifyOrderTransaction(TransactionRef);
    this.logger.log('Processing payment verification:', TransactionRef);
  }

  async handleDropshippingVerification(TransactionRef: string) {
    await this.dropshippingService.updateDropshippingPayment(TransactionRef);
    this.logger.log('Processing shipping verification:', TransactionRef);
  }
}

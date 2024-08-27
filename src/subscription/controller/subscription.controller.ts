import { Controller, Post, Body, Param } from '@nestjs/common';
import { SubscriptionService } from '../service/subscription.service';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post(':userId')
  async subscribe(
    @Param('userId') userId: string,
    @Body('type') type: string,
    @Body('amount') amount: number,
  ) {
    return this.subscriptionService.createSubscription(userId, type, amount);
  }
}

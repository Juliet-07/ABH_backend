import {
  Controller,
  Post,
  Body,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SubscriptionService } from '../service/subscription.service';
import { CreateSubscriptionDto } from '../dto/create.sub.dto';
import { AuthGuard } from 'src/auth/auth.guard';

@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async subscribe(@Request() req, @Body() payload: CreateSubscriptionDto) {
    console.log('Incoming payload:', payload);
    const userId = req.user;
    return await this.subscriptionService.createSubscription(userId, payload);
  }
}

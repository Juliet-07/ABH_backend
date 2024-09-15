import { IsOptional, IsEnum, IsNumber } from 'class-validator';
import { PaymentGatewayEnums } from 'src/constants';
import { IsNotEmpty } from 'class-validator';

export enum SubscriptionType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CreateSubscriptionDto {
  @IsEnum(SubscriptionType)
  plan: SubscriptionType;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(PaymentGatewayEnums)
  paymentGateway: string;
}

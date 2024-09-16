import { IsOptional, IsEnum, IsNumber, IsString } from 'class-validator';
import { PaymentGatewayEnums } from 'src/constants';
import { IsNotEmpty } from 'class-validator';

export enum SubscriptionType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
}

export class CreateSubscriptionDto {
  @IsString()
  plan: string;

  @IsNumber()
  amount: number;

  @IsOptional()
  @IsEnum(PaymentGatewayEnums)
  paymentGateway: string;
}

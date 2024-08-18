import { IsDecimal, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsDecimal()
  amount: number;

  @IsEmail()
  email: string;

  @IsString()
  customerName: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  meta?: string;

  @IsOptional()
  @IsString()
  transactionRef?: string;

  @IsString()
  callback: string;
}

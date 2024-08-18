import { IsEmail, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @IsNumber()
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



export class CreatePayStackPaymentDto {
  @IsNumber()
  amount: number;

  @IsEmail()
  email: string;

  @IsString()
  reference: string;

  @IsString()
  callback_url?: string;
}
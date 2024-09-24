import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

class ShipmentItemDto {
  @IsString()
  ItemName: string;

  @IsNumber()
  ItemUnitCost: number;

  @IsNumber()
  ItemQuantity: number;

  @IsString()
  ItemColour: string;

  @IsString()
  ItemSize: string;
}

export class PickupRequestDto {
  @IsString()
  OrderNo: string;

  @IsString()
  Description: string;

  @IsNumber()
  Weight: number;

  @IsString()
  SenderName: string;

  @IsString()
  SenderCity: string;

  @IsString()
  SenderTownID: string;

  @IsString()
  SenderAddress: string;

  @IsString()
  SenderPhone: string;

  @IsString()
  SenderEmail: string;

  @IsString()
  RecipientName: string;

  @IsString()
  RecipientCity: string;

  @IsString()
  RecipientTownID: string;

  @IsString()
  RecipientAddress: string;

  @IsString()
  RecipientPhone: string;

  @IsString()
  RecipientEmail: string;

  @IsString()
  PaymentType: string;

  @IsString()
  DeliveryType: string;

  @IsOptional()
  PickupType: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShipmentItemDto)
  ShipmentItems: ShipmentItemDto[];
}

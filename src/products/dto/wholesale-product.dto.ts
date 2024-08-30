import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsString,
  IsNumber,
  IsOptional,
  IsNumberString,
  IsJSON,
  IsBoolean,
  IsNotEmpty,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { ProductTypeEnums } from 'src/constants';
import { Currencies } from 'src/utils/constants';

const currency_enums = Object.keys(Currencies);

export class CreateWholeSaleProductDto {
  @IsEnum(ProductTypeEnums)
  productType: ProductTypeEnums = ProductTypeEnums.WHOLESALE;

  @IsString()
  name: string;

  @IsNotEmpty()
  color: string;

  @IsOptional()
  discount?: number;

  //@IsNumber()
  maximumOrderPerCarton: number;

  //@IsNumber()
  unitPerCarton: number;

  weight: number;

  subcategoryId?: mongoose.Types.ObjectId;

  @IsString()
  description: string;

  @IsNotEmpty()
  price: number;

  @IsString()
  categoryId: mongoose.Types.ObjectId;


  @IsNumberString()
  quantity: number;

  @IsString()
  @IsNotEmpty()
  size: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsJSON()
  @IsOptional()
  images?: {
    id: number;
    url: string;
  }[];

  featured_image: string;

  @IsString()
  @IsOptional()
  manufacturer: string;

  @IsEnum(currency_enums)
  @IsString()
  currency: string;
}

export class CreateMultipleWholeSaleProductsDto {
  @ApiProperty({ type: [CreateWholeSaleProductDto] })
  @ValidateNested({ each: true })
  @Type(() => CreateWholeSaleProductDto)
  products: CreateWholeSaleProductDto[];
}

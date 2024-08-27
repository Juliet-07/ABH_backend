import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDefined,
  IsEnum,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  IsUrl,
} from 'class-validator';
import { Currencies } from '../../utils/constants';
import mongoose from 'mongoose';

const currency_enums = Object.keys(Currencies);

export class CreateProductDto {
  @IsString()
  @ApiProperty({
    type: String,
    description: 'Product Name',
  })
  name: string;

  @IsString()
  color: string;

  @IsOptional()
  discount?: number;

  @IsNumberString()
  @ApiProperty({
    type: Number,
    description: 'Quantity',
  })
  quantity: number;

  @IsString()
  unit: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    description: 'Size',
  })
  size: string;

  @IsString()
  @ApiProperty({
    type: String,
    description: 'Product Description',
  })
  description: string;

  @ApiProperty({
    type: String,
    description: 'Category ID',
  })
  @IsNotEmpty()
  categoryId: mongoose.Types.ObjectId;

  //@IsOptional()
  subcategoryId?: mongoose.Types.ObjectId;

  @ApiProperty({
    type: String,
    description: 'SubCategory ID',
  })
  @IsNumberString()
  @ApiProperty({
    type: Number,
    description: 'Product price',
  })
  price: number;

  @IsUrl()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Product Video URL',
  })
  videoUrl: string;

  @IsString()
  @IsEnum(currency_enums)
  @ApiProperty({
    type: String,
    description: 'Currency',
  })
  currency: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    type: String,
    description: 'Product SkU',
  })
  sku: string;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Sale Price (Optional)',
  })
  sellingPrice?: number;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    description: 'In Stock',
  })
  inStock: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    description: 'Is the product taxable?',
  })
  isTaxable: boolean;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    description: 'Product in Flash sale',
  })
  inFlashSale: boolean;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Product Height',
  })
  height?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Product Width',
  })
  width?: number;

  @IsNumber()
  @IsOptional()
  @ApiProperty({
    type: Number,
    description: 'Product Length',
  })
  length?: number;

  @IsJSON()
  @IsOptional()
  @ApiProperty({
    type: JSON,
    description: 'Product Images [URL]',
  })
  images?: {
    id: number;
    url: string;
  }[];

  @IsString()
  @IsDefined()
  @ApiProperty({
    type: String,
    description: 'Manufacturer',
  })
  manufacturer: string;

  @IsBoolean()
  @IsOptional()
  @ApiProperty({
    type: Boolean,
    description: 'Product is in wishlist',
  })
  inWishlist: boolean;
}

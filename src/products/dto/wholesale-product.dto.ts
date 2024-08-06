import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsArray, IsNumber, IsOptional, IsNumberString, IsJSON, IsBoolean, IsDefined, IsUrl } from 'class-validator';
import { ProductTypeEnums } from 'src/constants';
import { Currencies } from 'src/utils/constants';

const currency_enums = Object.keys(Currencies);

export class CreateWholeSaleProductDto {
     @IsEnum(ProductTypeEnums)
     productType: ProductTypeEnums = ProductTypeEnums.WHOLESALE;

     @IsString()
     name: string;

     @IsString()
     categoryId: string;

     @IsOptional()
     @IsString()
     subcategoryId: string;

     @IsNumberString()
     quantity: number;

     @IsString()
     unit: string;

     @IsArray()
     size: string;

     @IsArray()
     color: string[];

     @IsString()
     brand: string;

     //@IsNumber()
     price: number;

     @IsString()
     description: string;

     @IsOptional()
     @IsArray()
     discount: number[];

     //@IsNumber()
     maximumOrderPerCarton: number;

     @IsEnum(currency_enums)
     @IsString()
     currency: string;

     @IsJSON()
     @IsOptional()
     images?: {
          id: number;
          url: string;
     }[];


     @IsString()
     @IsDefined()
     manufacturer: string;

     @IsBoolean()
     @IsOptional()
     inWishlist: boolean;

     @IsNumber()
     @IsOptional()
     height?: number;

     @IsNumber()
     @IsOptional()
     width?: number;

     @IsNumber()
     @IsOptional()
     length?: number;




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
     salePrice?: number;

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


     @IsUrl()
     @IsOptional()
     @ApiProperty({
          type: String,
          description: 'Product Video URL',
     })
     videoUrl: string;
}

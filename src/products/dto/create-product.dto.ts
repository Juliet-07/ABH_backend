import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsDefined, IsJSON, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateProductDto {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Product Name',
    })
    name: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Product Description',
    })
    description: string

    @IsNumber()
    @ApiProperty({
        type: Number,
        description: 'Product price',
    })
    price: number;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Product SkU',
    })
    sku: string;

    @IsNumber()
    @ApiProperty({
        type: Number,
        description: 'Quantity',
    })
    quantity: number;
  
    @IsNumber()
    @IsOptional()
    @ApiProperty({
        type: Number,
        description: 'Sale Price (Optional)',
    })
    salePrice?: number;
  
    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        type: Boolean,
        description: 'In Stock',
    })
    inStock: boolean;
  
    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        type: Boolean,
        description: 'Is the product taxable?',
    })
    isTaxable: boolean;
  
    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        type: Boolean,
        description: 'Product in Flash sale',
    })
    inFlashSale: boolean;
  
    @IsString()
    @IsDefined()
    @ApiProperty({
        type: String,
        description: 'Product Unit',
    })
    unit: string;
  
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
    @IsDefined()
    @ApiProperty({
        type: JSON,
        description: 'Product Images [URL]',
    })
    images: {
      id: number;
      url: string;
    }[];
  
    @IsNumber()
    @IsOptional()
    @ApiProperty({
        type: Number,
        description: 'Manufacturer ID (optiona)',
    })
    manufacturerId?: number;
  
    @IsBoolean()
    @IsDefined()
    @ApiProperty({
        type: Boolean,
        description: 'Product is in wishlist',
    })
    inWishlist: boolean;

}

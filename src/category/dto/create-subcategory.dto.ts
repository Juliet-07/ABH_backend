import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CreateSubcategoryDto {
  @IsString()
  @IsDefined()
  @ApiProperty({
    type: String,
    description: 'Subcategory Name',
  })
  name: string;

  @IsString()
  @IsDefined()
  @ApiProperty({
    type: String,
    description: 'Subcategory Description',
  })
  description: string;

  @IsString()
  @IsDefined()
  @ApiProperty({
    type: String,
    description: 'Parent Category ID',
  })
  categoryId: string;
}

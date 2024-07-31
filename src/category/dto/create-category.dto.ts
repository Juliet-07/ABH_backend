import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Category Name',
    })
    name: string;
 
    @IsArray()
    subcategories: string[]

    @IsString()
    image: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Category Description',
    })
    description: string;
}

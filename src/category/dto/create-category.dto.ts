import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";

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
    @IsNotEmpty()
    @ApiProperty({
        type: String,
        description: 'Category Description',
    })
    description: string;
}

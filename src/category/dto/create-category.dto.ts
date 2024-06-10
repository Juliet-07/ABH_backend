import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateCategoryDto {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Category Name',
    })
    name: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Category Description',
    })
    description: string;
}

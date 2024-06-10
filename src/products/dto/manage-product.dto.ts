import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { ProductStatusEnums } from "../../constants";



export class ManageProductDto {
    @IsString()
    @IsEnum(ProductStatusEnums)
    @ApiProperty({
        type: String,
        description: 'Product Status',
    })
    status: string;
}

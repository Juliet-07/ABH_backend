import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEnum, IsString, ValidateIf } from "class-validator";
import { ProductStatusEnums } from "../../constants";



export class ManageProductDto {
    @IsString()
    @IsEnum(ProductStatusEnums)
    @ApiProperty({
        type: String,
        description: 'Product Status',
    })
    status: string;

    @IsString()
    @ValidateIf((o: ManageProductDto) => o.status === ProductStatusEnums.DECLINED)
    @IsDefined({ message: 'Comments must be defined when product is declined' })
    comments: string;
}

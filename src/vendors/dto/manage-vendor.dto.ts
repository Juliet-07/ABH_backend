import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsString } from "class-validator";
import { VendorStatusEnums } from "../../constants";

export class ManageVendorDto {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Status',
    })
    @IsEnum(VendorStatusEnums)
    status: string;
  
}

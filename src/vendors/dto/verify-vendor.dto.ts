import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyVendorDto {
    @IsEmail()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Vendor\'s Email'
    })
    email: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Vendor\'s Verification Code'
    })
    code: string;
}  
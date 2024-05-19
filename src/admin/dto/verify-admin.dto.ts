import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyAdminDto {
    @IsEmail()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'Admin\'s Email'
    })
    email: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Admin\'s Verification Code'
    })
    code: string;
}  
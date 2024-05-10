import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class VerifyUserDto {
    @IsEmail()
    @IsString()
    @ApiProperty({
        type: String,
        description: 'User\'s Email'
    })
    email: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'User\'s Verification Code'
    })
    code: string;
}  
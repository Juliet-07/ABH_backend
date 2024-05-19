import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword, Matches, MaxLength, MinLength } from "class-validator";

export class LoginAdminDto {
    @IsString()
    @IsEmail()
    @ApiProperty({
        type: String,
        description: 'Admin\'s Email',
    })
    email: string;

    @IsString()
    @IsStrongPassword()
    @MinLength(4)
    @MaxLength(20)
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    @ApiProperty({
        type: String,
        description: 'Password that matches the RegExp /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
    })
    password: string;
}

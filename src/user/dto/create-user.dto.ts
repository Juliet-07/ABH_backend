import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumberString, IsOptional, IsPhoneNumber, IsString, IsStrongPassword, Length, Matches, MaxLength, MinLength } from "class-validator";


export class CreateUserDto {
    @IsString()
    @ApiProperty({
        type: String,
        description: 'User\'s First Name',
    })
    firstName: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'User\'s Last Name',
    })
    lastName: string;

    @IsString()
    @IsEmail()
    @ApiProperty({
        type: String,
        description: 'User\'s Email',
    })
    email: string;

    @IsNumberString()
    @IsPhoneNumber('NG')
    @Length(11)
    @ApiProperty({
        type: String,
        description: 'Phone Number with country code',
    })
    phoneNumber: string;

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

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        description: 'Referral Code',
    })
    referralCode: string;
}

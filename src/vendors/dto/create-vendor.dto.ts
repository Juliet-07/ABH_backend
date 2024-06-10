import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsEmail, IsNumberString, IsOptional, IsPhoneNumber, IsString, Length } from "class-validator";


export class CreateVendorDto {
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
    @ApiProperty({
        type: String,
        description: 'Store Name',
    })
    store: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Store\'s Country',
    })
    country: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Store\'s City',
    })
    city: string;

    @IsString()
    @ApiProperty({
        type: String,
        description: 'Store\'s State',
    })
    state: string;

    @IsString()
    @IsDefined()
    @ApiProperty({
        type: String,
        description: 'Address',
    })
    address: string;

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

    @IsNumberString()
    @IsOptional()
    @IsPhoneNumber('NG')
    @Length(11)
    @ApiProperty({
        type: String,
        description: 'Alternative Phone Number with country code',
    })
    alternatePhoneNumber: string;

    @IsString()
    @IsDefined()
    @ApiProperty({
        type: String,
        description: 'Business Type',
    })
    businessType: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        description: 'National Identification Number',
    })
    nationalIdentificationNumber: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        description: 'Tax Identification Number',
    })
    taxIdentificationNumber: string;

    @IsString()
    @IsOptional()
    @ApiProperty({
        type: String,
        description: 'CAC Identification Number',
    })
    cacRegistrationNumber: string;

    // @IsString()
    // @IsStrongPassword()
    // @MinLength(4)
    // @MaxLength(20)
    // @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: 'password too weak' })
    // @ApiProperty({
    //     type: String,
    //     description: 'Password that matches the RegExp /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/',
    // })
    // password: string;
}

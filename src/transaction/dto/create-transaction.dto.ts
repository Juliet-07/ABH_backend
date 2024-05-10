import { IsString, IsEmail, IsNotEmpty, IsNumber, Min } from 'class-validator';


export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    item: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    price: number;
}

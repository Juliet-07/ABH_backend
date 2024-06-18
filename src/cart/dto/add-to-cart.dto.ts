import { IsArray, IsDefined, IsNumber, IsString } from "class-validator";

export class AddToCartDto {
    @IsDefined()
    @IsString()
    productId: string;

    @IsDefined()
    @IsNumber()
    quantity: number;
}

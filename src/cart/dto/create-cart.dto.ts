import { IsArray, IsDefined } from "class-validator";

export class CreateCartDto {
    @IsDefined()
    @IsArray()
    productIds: {
        product: string;
        quantity: number;
    }[];
}

import { IsDefined, IsEnum } from "class-validator";
import { PaymentGatewayEnums } from "../../constants";

export class ConfirmTransactionStatusDto {


    @IsDefined()
    @IsEnum(PaymentGatewayEnums)
    paymentGateway: string;

    @IsDefined()
    paymentReference: string;
}
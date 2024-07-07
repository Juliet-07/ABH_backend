import { IsDefined, IsEnum, IsOptional } from 'class-validator';
import { PaymentGatewayEnums, ShippingMethodEnums } from '../../constants';

class AddressDto {
    @IsDefined()
    street: string;
  
    @IsDefined()
    city: string;
  
    @IsDefined()
    state: string;
  
    @IsDefined()
    country: string;
  }
export class CreateOrderDto {
  @IsDefined()
  shippingAddress: AddressDto;

  @IsOptional()
  billingAddress: AddressDto;

  @IsDefined()
  shippingFee: number;

  @IsDefined()
  @IsEnum(ShippingMethodEnums)
  shippingMethod: string

  @IsDefined()
  @IsEnum(PaymentGatewayEnums)
  paymentGateway: string;
}



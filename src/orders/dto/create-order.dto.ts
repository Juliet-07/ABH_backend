import { IsDefined, IsOptional } from 'class-validator';

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
}



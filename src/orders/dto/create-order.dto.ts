import { IsDefined, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';
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

class PersonalInfoDto {
  @IsDefined()
  firstName: string;

  @IsDefined()
  lastName: string;

  @IsDefined()
  email: string;

  @IsDefined()
  phoneNumber: string;
}

class ProductDto {
  @IsDefined()
  @IsString()
  productId: string;

  @IsDefined()
  @IsNumber()
  quantity: number;
}

export class CreateOrderDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  //@IsDefined()
  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo: PersonalInfoDto;

  @IsDefined()
  @IsNumber()
  shippingFee: number;

  @IsDefined()
  @IsEnum(ShippingMethodEnums)
  shippingMethod: string;

  @IsOptional()
  @IsEnum(PaymentGatewayEnums)
  paymentGateway: string;

  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];
}

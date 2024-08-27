import {
  IsDefined,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
  IsDecimal,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaymentGatewayEnums,
  ShippingMethodEnums,
  SubscriptionTypeEnum,
} from '../../constants';

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

  @IsOptional()
  discount?: number;

  vendorId: string;
}

class DropShippingDto {
  @IsEnum(SubscriptionTypeEnum)
  type: string;

  amount: number;

  reference: string;
}

export class CreateDropShippingDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  billingAddress: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => DropShippingDto)
  subscriptionDetails: DropShippingDto;

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

  // @IsDecimal()
  vat: number;
}

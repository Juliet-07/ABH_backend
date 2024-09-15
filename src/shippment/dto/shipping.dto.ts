import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PaymentGatewayEnums, ShippingMethodEnums } from 'src/constants';

class ProductDto {
  //@IsDefined()
  @IsString()
  productId: string;


  @IsOptional()
  quantity: number;

 // @IsDefined()
 // @IsNumber()
  quantityShipped: number;

  //@IsDefined()
 // @IsNumber()
  quantityLeft: number;

 // @IsNotEmpty()
  @IsOptional()
  vendorId: string;
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

class AddressDto {
  @IsDefined()
  street: string;

  @IsDefined()
  city: string;

  @IsDefined()
  state: string;

  @IsDefined()
  @IsOptional()
  country?: string;

  @IsDefined()
  @IsOptional()
  town?: string;
}

export class CreateShippingDto {
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  products: ProductDto[];

  //   @IsNotEmpty()
  //   @IsString()
  //   reference: string;

  @IsEnum(PaymentGatewayEnums)
  paymentGateway: PaymentGatewayEnums;

  @IsDefined()
  @IsNumber()
  shippingFee: number;

  vat: number;

  @IsDefined()
  @IsEnum(ShippingMethodEnums)
  shippingMethod: ShippingMethodEnums;

  @IsDefined()
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested()
  @Type(() => PersonalInfoDto)
  personalInfo?: PersonalInfoDto;
}

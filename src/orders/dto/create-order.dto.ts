import {
  IsDefined,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  IsString,
} from 'class-validator';
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
  @IsOptional()
  country?: string;

  @IsDefined()
  town: string;

  @IsDefined()
  townId: string;
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

export class ProductDto {
  @IsDefined()
  @IsString()
  productId: string;

  @IsDefined()
  @IsNumber()
  quantity: number;

  @IsOptional()
  discount?: number;

  vendorId: string;

  sellingPrice: number;
}

export type ProductDetail = {
  product: {
    _id: string;
    sellingPrice: number;
    quantity: number;
    soldQuantity: number;
    vendor: string;
  };
  quantity: number;
  discount: number;
  vendorId: string;
  sellingPrice: number;
};

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
  shippingMethod: ShippingMethodEnums;

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

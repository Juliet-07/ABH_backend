import { IsArray, IsDefined, IsNumber, IsString } from 'class-validator';

export class SynchronizeCartItemDto {
  @IsDefined()
  @IsString()
  productId: string;

  @IsDefined()
  @IsNumber()
  quantity: number;
}

export class SynchronizeCartDto {
  @IsDefined()
  items: SynchronizeCartItemDto[];
}

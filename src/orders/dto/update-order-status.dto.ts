import { IsDefined, IsEnum } from 'class-validator';
import { OrderStatusEnum } from '../../constants';

export class UpdateOrderStatusDto {
  @IsDefined()
  @IsEnum(OrderStatusEnum)
  deliveryStatus: OrderStatusEnum;
  
}


export class UpdateOrderStatusDto1 {
  // @IsString()
  // @IsNotEmpty()
  // deliveryStatus: string;


  @IsDefined()
  @IsEnum(OrderStatusEnum)
  deliveryStatus: OrderStatusEnum;
}
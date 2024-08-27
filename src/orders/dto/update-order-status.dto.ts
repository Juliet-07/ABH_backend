import { IsDefined, IsEnum } from 'class-validator';
import { OrderStatusEnum } from '../../constants';

export class UpdateOrderStatusDto {
  @IsDefined()
  @IsEnum(OrderStatusEnum)
  deliveryStatus: OrderStatusEnum;
  
}



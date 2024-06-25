import { PartialType } from '@nestjs/swagger';
import { AddToCartDto } from './add-to-cart.dto';

export class UpdateCartDto extends PartialType(AddToCartDto) {}

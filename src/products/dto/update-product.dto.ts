import { PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { Product } from '../schema/product.schema';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

export class UpdateProductsDto extends PartialType(Product) {}
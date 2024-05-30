import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { HelpersService } from '../utils/helpers/helpers.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private helpers: HelpersService,
  ) {

  }
  async create(createProductDto: CreateProductDto, vendor) {
    try {
      const product = this.productRepository.create(createProductDto);

      // Generate Admin Unique Code
      product.code = this.helpers.genCode(10)
      product.slug = `${this.helpers.convertProductNameToSlug(product.name)}-${product.code}`
      product.vendorId = vendor.id
      product.createdBy = vendor.id

      const result = await this.productRepository.save(product);

      // Invalidate cache after a new admin is created
      // await this.cacheManager.del(this.cacheKey);

      return result;

    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all products`;
  }

  fetchTopProducts() {
    return [];
  }

  findOne(id: number) {
    return `This action returns a #${id} product`;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}

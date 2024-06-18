import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Repository } from 'typeorm';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}
  async addToCart(addToCartDto: AddToCartDto, userId: string) {
    try {
      let cart: Cart;
      // Get the cart if created
      cart = await this.cartRepository.findOne({ where: { userId } });

      // Validate if product quantity is still available
      const { productId } = addToCartDto;
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException('Product Not Found');
      }
      if (product.quantity < addToCartDto.quantity) {
        throw new BadRequestException('Product quantity is not available');
      }

      if (cart) {
        const productExists = cart.products.find(
          (product) => product.productId === productId,
        );
        if (productExists) throw new Error('Product Exists in cart');

      } else {
        cart = await this.cartRepository.create({userId, products: []});

      }

      cart.products.push(addToCartDto)

      cart = await this.cartRepository.save(cart);

      return cart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all cart`;
  }

  async findOne(id: string) {
    const result = await this.cartRepository.findOne({where: {userId: id}})
    return result;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}

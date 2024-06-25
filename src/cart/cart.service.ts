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
import { SynchronizeCartDto } from './dto/synchronize-cart.dto';

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
        cart = await this.cartRepository.create({ userId, products: [] });
      }

      cart.products.push(addToCartDto);

      cart = await this.cartRepository.save(cart);

      return cart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async synchronizeCart(syncCartDto: SynchronizeCartDto, userId: string) {
    try {
      let cart: Cart;
      // Get the cart if created
      cart = await this.cartRepository.findOne({ where: { userId } });

      if (!cart) {
        cart = await this.cartRepository.create({ userId, products: [] });
      }

      // Validate if product quantity is still available
      let itemsToAdd = await Promise.all(
        syncCartDto.items.map(async (item) => {
          const { productId, quantity } = item;
          const product = await this.productRepository.findOne({
            where: { id: productId },
          });
          if (!product) {
            throw new NotFoundException('Product Not Found');
          }
          if (product.quantity < quantity) {
            throw new BadRequestException('Product quantity is not available');
          }

          const productExists = cart.products.find(
            (product) => product.productId === productId,
          );

          return !productExists ? item : null;
        }),
      );

      // Filter null values (Basically products that exists in cart)
      itemsToAdd = itemsToAdd.filter((item) => item !== null);
      cart.products = [...cart.products, ...itemsToAdd];
      cart = await this.cartRepository.save(cart);
      return cart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateCart(
    updateCartDto: UpdateCartDto,
    productId: string,
    userId: string,
  ) {
    try {
      // Get the cart if created
      const cart = await this.cartRepository.findOne({ where: { userId } });

      if (!cart) throw new Error('Cart does not exist, pls add to cart');

      // Validate if product quantity is still available
      const product = await this.productRepository.findOne({
        where: { id: productId },
      });
      if (!product) {
        throw new NotFoundException('Product Not Found');
      }
      if (product.quantity < updateCartDto.quantity) {
        throw new BadRequestException('Product quantity is not available');
      }

      cart.products = cart.products.map((product) => {
        if (product.productId === productId) {
          product.quantity = updateCartDto.quantity;
        }
        return product;
      });

      const result = await this.cartRepository.save(cart);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateCart(userId: string) {
    try {
      const cart = await this.cartRepository.findOne({ where: { userId } });

      // const validitems = await Promise.all();

      let valid = false;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all cart`;
  }

  async findOne(id: string) {
    const result = await this.cartRepository.findOne({ where: { userId: id } });
    return result;
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}

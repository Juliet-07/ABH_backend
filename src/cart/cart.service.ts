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
import { ProductStatusEnums } from '../constants';
import { HelpersService } from '../utils/helpers/helpers.service';
import { DeliveryEstimateDto } from './dto/delivery-estimate.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private helperService: HelpersService
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
      if (product.status !== ProductStatusEnums.APPROVED) {
        throw new NotFoundException('Product Not Found');
      }
      if (product.quantity - product.soldQuantity < addToCartDto.quantity) {
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
      console.error("THE ERROR", error)
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
          if (product.quantity - product.soldQuantity < quantity) {
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
      if (product.quantity - product.soldQuantity < updateCartDto.quantity) {
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

      if (!cart.products?.length)
        throw new BadRequestException('No Products in Cart');

      const validitems = await Promise.all(
        cart.products.map(async (product$) => {
          const product = await this.productRepository.findOne({
            where: { id: product$.productId },
          });
          if (!product) {
            throw new NotFoundException('Product Not Found');
          }
          if (product.quantity - product.soldQuantity < product$.quantity) {
            return {
              productId: product.id,
              valid: false,
            };
          }
          return {
            productId: product.id,
            valid: true,
          };
        }),
      );

      const valid = validitems.every((product) => product.valid === true);

      return {
        items: validitems,
        valid,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async removeProductFromCart(userId: string, productId: string) {
    try {
      const cart = await this.cartRepository.findOne({ where: { userId } });

      if (!cart) throw new NotFoundException('No cart found');

      if (!cart.products?.length)
        throw new BadRequestException('No Products in Cart');

      const productToDelete = cart.products.find(
        (item) => item.productId === productId,
      );

      if (!productToDelete)
        throw new NotFoundException('Product not found in cart');

      const result = await this.cartRepository.update(cart.id, {
        products: cart.products.filter((item) => item.productId !== productId),
      });

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getDeliveryEstimate(
    id: string,
    deliveryEstimateDto: DeliveryEstimateDto,
  ) {
    try {
      const cart = await this.cartRepository.findOne({ where: { userId: id } });

      if (!cart) throw new Error('Invalid Cart');
      if (!cart.products.length) throw new Error('No products in cart');

      const result = [
        {
          name: 'GIG_LOGISTICS',
          value: this.helperService.genString(4, '123456789')
        },
        {
          name: 'NIPOST',
          value: this.helperService.genString(4, '123456789')
        }
      ]

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all cart`;
  }

  async findOne(id: string) {
    const result = await this.cartRepository.findOne({ where: { userId: id } });
    if (result && result.products?.length) {
      const products = await Promise.all(
        result?.products.map(async (item) => {
          const product = await this.productRepository.findOne({
            where: { id: item.productId },
          });
          if (!product) return null;
          return {
            product,
            quantity: item.quantity,
          };
        }),
      );
      return products;
    }
    return [];
  }

  update(id: number, updateCartDto: UpdateCartDto) {
    return `This action updates a #${id} cart`;
  }

  remove(id: number) {
    return `This action removes a #${id} cart`;
  }
}

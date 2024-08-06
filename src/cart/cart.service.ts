import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCartDto } from './dto/create-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { SynchronizeCartDto } from './dto/synchronize-cart.dto';
import { ProductStatusEnums } from '../constants';
import { HelpersService } from '../utils/helpers/helpers.service';
import { DeliveryEstimateDto } from './dto/delivery-estimate.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Cart } from './schema/cart.schema';
import { Product } from 'src/products/schema/product.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,

    private helperService: HelpersService
  ) { }
  async addToCart(addToCartDto: AddToCartDto, userId: string) {
    try {
      // Retrieve the cart for the user or create a new one if it doesn't exist
      let cart = await this.cartModel.findOne({ userId });

      // Validate if product exists and is approved
      const { productId, quantity } = addToCartDto;
      const product = await this.productModel.findById(productId);
      if (!product) {
        throw new NotFoundException('Product Not Found');
      }
      if (product.status !== ProductStatusEnums.APPROVED) {
        throw new BadRequestException('Product is not approved');
      }
      if (product.quantity - product.soldQuantity < quantity) {
        throw new BadRequestException('Product quantity is not available');
      }

      if (!cart) {
        // Create a new cart if it does not exist
        cart = await this.cartModel.create({ userId, products: [] });
      }

      // Check if the product is already in the cart
      const existingProductIndex = cart.products.findIndex(
        (item) => item.productId === productId,
      );

      if (existingProductIndex > -1) {
        // Update the quantity of the existing product in the cart
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Add new product to the cart
        cart.products.push({ ...addToCartDto });
      }

      // Save the updated cart
      await cart.save();

      return cart;
    } catch (error) {
      console.error('Error while adding to cart:', error);
      throw new BadRequestException(error.message);
    }
  }
  async synchronizeCart(syncCartDto: SynchronizeCartDto, userId: string) {
    try {
      let cart: Cart;
      // Get the cart if created
      cart = await this.cartModel.findOne({ userId });

      if (!cart) {
        cart = await this.cartModel.create({ userId, products: [] });
      }

      // Validate if product quantity is still available
      let itemsToAdd = await Promise.all(
        syncCartDto.items.map(async (item) => {
          const { productId, quantity } = item;
          const product = await this.productModel.findOne({
            _id: productId
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
      cart = await this.cartModel.create(cart);
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
      const cart = await this.cartModel.findOne({ userId });

      if (!cart) throw new Error('Cart does not exist, pls add to cart');

      // Validate if product quantity is still available
      const product = await this.productModel.findOne({
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

      const result = await this.cartModel.create(cart);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateCart(userId: string) {
    try {
      const cart = await this.cartModel.findOne({ userId });

      if (!cart.products?.length)
        throw new BadRequestException('No Products in Cart');

      const validitems = await Promise.all(
        cart.products.map(async (product$) => {
          const product = await this.productModel.findOne({
            _id: product$.productId
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
      const cart = await this.cartModel.findOne({ userId });

      if (!cart) throw new NotFoundException('No cart found');

      if (!cart.products?.length)
        throw new BadRequestException('No Products in Cart');

      const productToDelete = cart.products.find(
        (item) => item.productId === productId,
      );

      if (!productToDelete)
        throw new NotFoundException('Product not found in cart');

      const result = await this.cartModel.findOneAndUpdate({_id:cart.id}, {$set:{
        products: cart.products.filter((item) => item.productId !== productId),
    }});

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
      const cart = await this.cartModel.findOne({ userId: id } );

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
    const result = await this.cartModel.findOne({ where: { userId: id } });
    if (result && result.products?.length) {
      const products = await Promise.all(
        result?.products.map(async (item) => {
          const product = await this.productModel.findOne(
            { _id: item.productId },
          );
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

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateCartDto } from './dto/update-cart.dto';
import { SynchronizeCartDto } from './dto/synchronize-cart.dto';
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

    private helperService: HelpersService,
    
  ) { }

  async addToCart(syncCartDto: SynchronizeCartDto, userId: string) {
    try {
      let cart = await this.cartModel.findOne({ userId });

      if (!cart) {
        cart = await this.cartModel.create({ userId, products: [] });
      }

      // Create a map to store products to be added or updated
      const productUpdates = new Map();

      for (const item of syncCartDto.items) {
        const { productId, quantity } = item;
        const product = await this.productModel.findById(productId);

        if (!product) {
          throw new NotFoundException(`Product with ID ${productId} not found`);
        }
        if (product.quantity - product.soldQuantity < quantity) {
          throw new BadRequestException(`Insufficient quantity for product ID ${productId}`);
        }

        const existingProduct = cart.products.find(
          (cartProduct) => cartProduct.productId.toString() === productId
        );

        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          productUpdates.set(productId, quantity);
        }
      }

      // Add new products from the map
      for (const [productId, quantity] of productUpdates.entries()) {
        cart.products.push({ productId, quantity });
      }

      // Save the updated cart
      await cart.save();

      return cart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  // async addToCart(addToCartDto: AddToCartDto, userId: string) {
  //   try {
  //     // Retrieve the cart for the user or create a new one if it doesn't exist
  //     let cart = await this.cartModel.findOne({ userId });

  //     // Validate if product exists and is approved
  //     const { productId, quantity } = addToCartDto;
  //     const product = await this.productModel.findById(productId);
  //     if (!product) {
  //       throw new NotFoundException('Product Not Found');
  //     }
  //     if (product.status !== ProductStatusEnums.APPROVED) {
  //       throw new BadRequestException('Product is not approved');
  //     }
  //     if (product.quantity - product.soldQuantity < quantity) {
  //       throw new BadRequestException('Product quantity is not available');
  //     }

  //     if (!cart) {
  //       // Create a new cart if it does not exist
  //       cart = await this.cartModel.create({ userId, products: [] });
  //     }

  //     // Check if the product is already in the cart
  //     const existingProductIndex = cart.products.findIndex(
  //       (item) => item.productId === productId,
  //     );

  //     if (existingProductIndex > -1) {
  //       // Update the quantity of the existing product in the cart
  //       cart.products[existingProductIndex].quantity += quantity;
  //     } else {
  //       // Add new product to the cart
  //       cart.products.push({ ...addToCartDto });
  //     }

  //     // Save the updated cart
  //     await cart.save();

  //     return cart;
  //   } catch (error) {
  //     console.error('Error while adding to cart:', error);
  //     throw new BadRequestException(error.message);
  //   }
  // }
  async synchronizeCart(syncCartDto: SynchronizeCartDto, userId: string) {
    try {
      let cart = await this.cartModel.findOne({ userId });

      if (!cart) {
        cart = await this.cartModel.create({ userId, products: [] });
      }

      const itemsToAdd = await Promise.all(
        syncCartDto.items.map(async (item) => {
          const { productId, quantity } = item;
          const product = await this.productModel.findOne({ _id: productId });

          if (!product) {
            throw new NotFoundException('Product Not Found');
          }
          if (product.quantity - product.soldQuantity < quantity) {
            throw new BadRequestException('Product quantity is not available');
          }

          const productExists = cart.products.find(
            (cartProduct) => cartProduct.productId.toString() === productId
          );

          if (productExists) {
            productExists.quantity += quantity;
            return null; // No need to add a new item, the quantity has been updated
          }

          return item;
        })
      );

      // Filter null values (Basically products that exist in the cart)
      const validItemsToAdd = itemsToAdd.filter((item) => item !== null);

      cart.products = [...cart.products, ...validItemsToAdd];

      // Use findOneAndUpdate to update the cart atomically
      const updatedCart = await this.cartModel.findOneAndUpdate(
        { userId },
        { products: cart.products },
        { new: true }
      );

      return updatedCart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }


  async updateCart(updateCartDto: UpdateCartDto, productId: string, userId: string) {
    try {
      const cart = await this.cartModel.findOne({ userId });

      if (!cart) {
        throw new Error('Cart does not exist, please add to cart');
      }

      const product = await this.productModel.findById(productId);

      if (!product) {
        throw new NotFoundException('Product Not Found');
      }
      if (product.quantity - product.soldQuantity < updateCartDto.quantity) {
        throw new BadRequestException('Product quantity is not available');
      }

      // Check if the product exists in the cart
      const existingProduct = cart.products.find(
        (cartProduct) => cartProduct.productId.toString() === productId
      );

      if (!existingProduct) {
        throw new BadRequestException('Product is not in the cart');
      }

      // Update the product quantity
      existingProduct.quantity = updateCartDto.quantity;

      // Save the updated cart
      await cart.save();

      return cart;
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
      console.log(cart)

      if (!cart) throw new NotFoundException('No cart found');

      if (!cart.products?.length) throw new BadRequestException('No products in cart');

      const productToDelete = cart.products.find(
        (item) => item.productId.toString() === productId
      );

      if (!productToDelete) throw new NotFoundException('Product not found in cart');

      const updatedCart = await this.cartModel.findOneAndUpdate(
        { _id: cart.id },
        {
          $set: {
            products: cart.products.filter((item) => item.productId.toString() !== productId),
          },
        },
        { new: true } // This option ensures that the updated document is returned
      );

      return updatedCart;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // async getDeliveryEstimate(
  //   id: string,
  //   shippingData: DeliveryEstimateDto,
  // ) {
  //   try {
  //     const cart = await this.cartModel.findOne({ userId: id });

  //     if (!cart) throw new Error('Invalid Cart');
  //     if (!cart.products.length) throw new Error('No products in cart');

  //     const price = await this.gigLogisticsService.getShippingPrice(shippingData);
  //     console.log('Shipping Price:', price);
  //     return price;



  //   } catch (error) {
  //     console.log(error)
  //     throw new BadRequestException(error.message);
  //   }
  // }

  findAll() {
    return `This action returns all cart`;
  }

  async findOne(id: string) {
    const result = await this.cartModel.findOne({ userId: id });
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

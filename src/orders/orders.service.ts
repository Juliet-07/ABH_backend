import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    private helper: HelpersService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const cart = await this.cartRepository.findOne({ where: { userId } });

      if (!cart) throw new NotFoundException('No Cart');

      const { shippingAddress, billingAddress } = createOrderDto;
      const order = await this.orderRepository.create({
        shippingAddress,
        items: cart.products,
        userId,
        reference: this.helper.genString(30),
        ...(billingAddress && billingAddress),
      });

      // Calculate totalAmount
      let products = await Promise.all(
        cart?.products.map(async (item) => {
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
      products = products.filter((product) => product !== null);
      const totalAmount = products
        .map((product) => product.product.price)
        .reduce((a, b) => a + b, 0);
      order.totalAmount = totalAmount;

      const result = await this.orderRepository.save(order);

      return result;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all orders`;
  }

  findOne(id: number) {
    return `This action returns a #${id} order`;
  }

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}

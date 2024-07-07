import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Cart } from '../cart/entities/cart.entity';
import { HelpersService } from '../utils/helpers/helpers.service';
import { Product } from '../products/entities/product.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { Transaction } from '../transaction/entities/transaction.entity';
import { CartService } from '../cart/cart.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderStatusEnum,
  PaymentGatewayEnums,
  PaymentStatusEnum,
} from '../constants';
import { ConfirmTransactionStatusDto } from './dto/confirm-transaction-status.dto';
import { HydrogenpayService } from '../services/hydrogenpay/hydrogenpay.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,

    @InjectRepository(Product)
    private productRepository: Repository<Product>,

    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,

    private helper: HelpersService,
    private cartService: CartService,
    private hydrogenPayService: HydrogenpayService,
  ) {}

  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const cart = await this.cartRepository.findOne({ where: { userId } });

      if (!cart) throw new NotFoundException('No Cart');

      const { valid } = await this.cartService.validateCart(userId);

      if (!valid) throw new Error('Cart contains invalid items');

      // Calculate totalAmount
      const products = await Promise.all(
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
      const items = products.filter((product) => product !== null);
      const totalProductAmount = products
        .map((product) => product.product.price)
        .reduce((a, b) => a + b, 0);

      // const shippingFeeEstimate = await this.cartService.getDeliveryEstimate(userId, createOrderDto.shippingAddress);

      // const shippingFee = shippingFeeEstimate.find(opt => opt.name === createOrderDto.shippingMethod)?.value

      // if (Number(createOrderDto.shippingFee) !== Number(shippingFee)) throw new Error('Invalid Shipping Fee Passed')

      const shippingFee = createOrderDto.shippingFee;

      const transactionData = await this.transactionRepository.create({
        reference: this.helper.genString(20),
        paymentGateway: createOrderDto.paymentGateway,
        totalProductAmount,
        shippingFee: Number(shippingFee),
        amount: Number(totalProductAmount) + Number(shippingFee),
      });

      const transaction = await this.transactionRepository.save(
        transactionData,
      );

      const { shippingAddress, billingAddress, shippingMethod } =
        createOrderDto;

      const orders = await Promise.all(
        items.map(async (item) => {
          const order = await this.orderRepository.create({
            shippingAddress,
            productId: item.product.id,
            userId,
            quantity: item.quantity,
            shippingMethod,
            vendorId: item.product.vendorId,
            reference: this.helper.genString(15, '1234567890'),
            transactionId: transaction.id,
            totalAmount: Number(item.product.price) * Number(item.quantity),
            ...(billingAddress && billingAddress),
          });

          await this.productRepository.update(item.product.id, {
            soldQuantity:
              Number(item.product.soldQuantity) + Number(item.quantity),
          });

          return await this.orderRepository.save(order);
        }),
      );

      // Side Effect to remove products from cart
      this.cartRepository.update(cart.id, {
        products: [],
      });

      return orders;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Order>> {
    return paginate(query, this.orderRepository, {
      sortableColumns: ['createdAt'],
      nullSort: 'last',
      relations: ['product', 'transaction'],
      defaultSortBy: [['createdAt', 'DESC']],
      filterableColumns: {
        id: true,
        vendorId: true,
        userId: true,
        status: true,
      },
    });
  }

  async fetchMyOrders(
    id: string,
    query: PaginateQuery,
    userType: 'vendor' | 'user',
  ): Promise<Paginated<Order>> {
    try {
      if (userType === 'vendor') {
        query.filter = {
          ...query.filter,
          vendorId: id,
        };
      } else {
        query.filter = {
          ...query.filter,
          userId: id,
        };
      }
      return paginate(query, this.orderRepository, {
        sortableColumns: ['createdAt'],
        nullSort: 'last',
        relations: ['product', 'transaction'],
        defaultSortBy: [['createdAt', 'DESC']],
        filterableColumns: {
          id: true,
          vendorId: true,
          userId: true,
          status: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateOrderStatus(
    id: string,
    vendorId: string,
    updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    try {
      const { status } = updateOrderStatusDto;

      const order = await this.orderRepository.findOne({
        where: { id },
        relations: ['transaction'],
      });
      if (!order) throw new NotFoundException('Order not found');
      if (order.vendorId !== vendorId)
        throw new UnauthorizedException(
          'You are not authorized to update this order',
        );
      if (order.transaction.status !== PaymentStatusEnum.SUCCESSFUL)
        throw new Error('Payment not confirmed yet');

      const update = {
        status: null,
      };

      // Switch Case in case we'd to send an email for each stage
      switch (status) {
        case OrderStatusEnum.CONFIRMED:
          if (order.status !== OrderStatusEnum.PENDING)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.PENDING}`,
            );
          update.status = OrderStatusEnum.CONFIRMED;
          break;

        case OrderStatusEnum.DECLINED:
          if (order.status !== OrderStatusEnum.PENDING)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.PENDING}`,
            );
          update.status = OrderStatusEnum.DECLINED;
          break;

        case OrderStatusEnum.PROCESSING:
          if (order.status !== OrderStatusEnum.CONFIRMED)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.CONFIRMED}`,
            );
          update.status = OrderStatusEnum.PROCESSING;
          break;

        case OrderStatusEnum.READY_TO_SHIP:
          if (order.status !== OrderStatusEnum.PROCESSING)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.PROCESSING}`,
            );
          update.status = OrderStatusEnum.READY_TO_SHIP;
          break;

        case OrderStatusEnum.SHIPPED:
          if (order.status !== OrderStatusEnum.READY_TO_SHIP)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.READY_TO_SHIP}`,
            );
          update.status = OrderStatusEnum.SHIPPED;
          break;

        case OrderStatusEnum.DELIVERED:
          if (order.status !== OrderStatusEnum.SHIPPED)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.SHIPPED}`,
            );
          update.status = OrderStatusEnum.DELIVERED;
          break;

        case OrderStatusEnum.RETURNED:
          if (order.status !== OrderStatusEnum.DELIVERED)
            throw new BadRequestException(
              `Order status should be ${OrderStatusEnum.DELIVERED}`,
            );
          update.status = OrderStatusEnum.RETURNED;
          break;

        default:
          throw new Error('Invalid Status');
      }

      return await this.orderRepository.update(id, update);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async confirmTransactionStatus(
    transactionId: string,
    userId: string,
    confirmTransactionStatusDto: ConfirmTransactionStatusDto,
  ) {
    try {
      if (!transactionId || !userId) throw new BadRequestException();

      const orderTransaction = await this.transactionRepository.findOne({
        where: { id: transactionId },
      });

      if (!orderTransaction) throw new NotFoundException('Order not found');

      if (orderTransaction.status !== PaymentStatusEnum.PENDING)
        throw new BadRequestException(
          `This Payment has been confirmed ${orderTransaction.status}`,
        );

      const { paymentGateway, paymentReference } = confirmTransactionStatusDto;

      let response;

      switch (paymentGateway) {
        case PaymentGatewayEnums.HYDROGENPAY:
          // Check for transaction status
          response = await this.hydrogenPayService.confirmTransaction({
            transactionRef: paymentReference,
            amount: orderTransaction.amount, // Passing this for testing sake
          });

          break;

        default:
          await this.transactionRepository.update(transactionId, {
            paymentGateway,
            paymentReference,
          });

          throw new Error('Gateway not supported');
      }

      if (!response.success) {
        await this.transactionRepository.update(transactionId, {
          paymentGateway,
          paymentReference,
        });
        throw new Error(response.error || 'An Error Occurred');
      }

      if (response?.data?.amount !== orderTransaction.amount) {
        await this.transactionRepository.update(transactionId, {
          paymentGateway,
          paymentReference,
        });

        throw new UnprocessableEntityException(
          'Transaction Mismatch, Kindly contact support',
        );
      }

      const update = {
        status: response.data.status,
        paymentGateway,
        paymentReference,
      };

      await this.transactionRepository.update(transactionId, update);

      return {
        message: `Payment ${response.data.status} `,
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

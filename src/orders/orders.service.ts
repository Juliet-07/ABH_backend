import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { HelpersService } from '../utils/helpers/helpers.service';
import { CartService } from '../cart/cart.service';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import {
  OrderStatusEnum,
  PaymentGatewayEnums,
  PaymentStatusEnum,
} from '../constants';
import { ConfirmTransactionStatusDto } from './dto/confirm-transaction-status.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schema/order.schema';
import { Cart } from 'src/cart/schema/cart.schema';
import { Product } from 'src/products/schema/product.schema';
import { Transaction } from 'src/transaction/schema/transaction.schema';
import { PaymentService } from 'src/payment/service/payments.service';
import { DeliveryEstimateDto } from 'src/cart/dto/delivery-estimate.dto';
import { GIGLogisticsService } from 'src/services/logistic/gig-logistics.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,

    private helper: HelpersService,
    private cartService: CartService,
    private readonly gigLogisticsService: GIGLogisticsService,

  ) { }



  async getDeliveryEstimate(

    shippingData: DeliveryEstimateDto,
  ) {
    try {
      const price = await this.gigLogisticsService.getShippingPrice(shippingData);
      console.log('Shipping Price:', price);
      return price;



    } catch (error) {
      console.log("THIS ERROR", error)
      throw new BadRequestException(error.message);
    }
  }

  // async create(createOrderDto: CreateOrderDto, userId: string) {
  //   try {
  //     const cart = await this.cartModel.findOne({ userId });

  //     if (!cart) throw new NotFoundException('No Cart found for the user.');

  //     const { valid } = await this.cartService.validateCart(userId);
  //     if (!valid) throw new BadRequestException('Cart contains invalid items.');

  //     // Calculate totalProductAmount
  //     const products = await Promise.all(
  //       cart.products.map(async (item) => {
  //         const product = await this.productModel.findById(item.productId); // Use findById for Mongoose
  //         if (!product) return null;
  //         return {
  //           product,
  //           quantity: item.quantity,
  //         };
  //       })
  //     );

  //     const items = products.filter((product) => product !== null);
  //     const totalProductAmount = items
  //       .map((item) => item.product.price * item.quantity)
  //       .reduce((a, b) => a + b, 0);

  //     const shippingFee = createOrderDto.shippingFee;
  //     const amount = totalProductAmount + Number(shippingFee);

  //     const transaction = await this.transactionModel.create({
  //       reference: this.helper.genString(20),
  //       paymentGateway: createOrderDto.paymentGateway,
  //       totalProductAmount,
  //       shippingFee: Number(shippingFee),
  //       amount,
  //     });

  //     const { shippingAddress, billingAddress, shippingMethod } = createOrderDto;

  //     const orders = await Promise.all(
  //       items.map(async (item) => {
  //         const order = await this.orderModel.create({
  //           shippingAddress,
  //           productId: item.product._id, // Use _id for Mongoose
  //           userId,
  //           quantity: item.quantity,
  //           shippingMethod,
  //           vendorId: item.product.vendorId,
  //           reference: this.helper.genString(15, '1234567890'),
  //           transactionId: transaction._id, // Use _id for Mongoose
  //           totalAmount: item.product.price * item.quantity,
  //           ...(billingAddress && { billingAddress }), // Ensure billingAddress is added correctly
  //         });

  //         await this.productModel.findByIdAndUpdate({_id: item.product._id}, {
  //           soldQuantity: item.product.soldQuantity + item.quantity,
  //         });

  //         return order;
  //       })
  //     );

  //     // Clear the cart
  //     await this.cartModel.findByIdAndUpdate({_id: cart._id}, { products: [] });

  //     return orders;
  //   } catch (error) {
  //     console.error('Error creating order:', error);
  //     throw new BadRequestException('Failed to create order.');
  //   }
  // }


  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const { shippingAddress, billingAddress, shippingMethod, personalInfo, products, shippingFee, paymentGateway } = createOrderDto;

      // Calculate totalAmount and totalProductAmount // Validate products and check availability
      const productDetails = await Promise.all(
        products.map(async (item) => {
          const product = await this.productModel.findById(item.productId);
          if (!product) {
            throw new NotFoundException(`Product with ID ${item.productId} not found`);
          }
          if (product.quantity - product.soldQuantity < item.quantity) {
            throw new BadRequestException(`Insufficient quantity for product ID ${item.productId}`);
          }
          return {
            product,
            quantity: item.quantity,
          };
        })
      );

      const totalProductAmount = productDetails
        .map((item) => item.product.sellingPrice * item.quantity)
        .reduce((a, b) => a + b, 0);

      createOrderDto.shippingFee = await this.gigLogisticsService.getShippingPrice(shippingAddress) || 450

      const amount = totalProductAmount + Number(shippingFee);


      const transaction = await this.transactionModel.create({
        reference: this.helper.genString(20),
        paymentGateway,
        totalProductAmount: amount,
        shippingFee: Number(shippingFee),
        amount,
      });

      const order = await this.orderModel.create({
        userId,
        shippingAddress,
        billingAddress,
        personalInfo,
        shippingMethod,
        reference: this.helper.genString(15, '1234567890'),
        transactionId: transaction._id,
        totalAmount: amount,
        products: productDetails.map((item) => ({
          productId: item.product._id, // Use _id for Mongoose
          quantity: item.quantity,
        })),
      });


      await Promise.all(
        productDetails.map((item) =>
          this.productModel.findByIdAndUpdate(
            { _id: item.product._id },
            { $inc: { soldQuantity: item.quantity } }
          )
        )
      );

      return order;
    } catch (error) {
      console.log("THE ERROR", error);
      throw new BadRequestException(error.message);
    }
  }


  async findAll(limit = 50, page = 1) {
    try {
      // Ensure limit and page are positive integers
      limit = Math.max(1, limit);
      page = Math.max(1, page);

      // Calculate the number of documents to skip
      const skip = (page - 1) * limit;

      // Fetch paginated documents
      const orders = await this.orderModel
        .find()
        .limit(limit)
        .skip(skip)
        .populate('product')
        .populate('transaction');

      // Count total number of documents
      const totalCount = await this.orderModel.countDocuments();

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      return {
        data: orders.length > 0 ? orders : null,
        totalCount,
        currentPage: page,
        prevPage,
        nextPage,
        currentLimit: limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders.');
    }
  }



  async fetchMyOrders(
    id: string,
    limit = 50,
    page = 1,
    userType: 'vendorId' | 'user'
  ): Promise<{
    data: Order[];
    totalCount: number;
    currentPage: number;
    prevPage: number | null;
    nextPage: number | null;
    currentLimit: number;
    totalPages: number;
  }> {
    try {
      // Ensure limit and page are positive integers
      limit = Math.max(1, limit);
      page = Math.max(1, page);

      // Calculate the number of documents to skip
      const skip = (page - 1) * limit;

      // Prepare the filter based on user type
      const filter: Record<string, any> = userType === 'vendorId'
        ? { vendorId: id }
        : { userId: id };

      // Fetch paginated documents
      const orders = await this.orderModel
        .find(filter)
        .limit(limit)
        .skip(skip)
        .populate('product')  // Optionally populate relations if needed
        .populate('transaction');  // Optionally populate relations if needed

      // Count total number of documents with the filter
      const totalCount = await this.orderModel.countDocuments(filter);

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / limit);
      const prevPage = page > 1 ? page - 1 : null;
      const nextPage = page < totalPages ? page + 1 : null;

      return {
        data: orders,
        totalCount,
        currentPage: page,
        prevPage,
        nextPage,
        currentLimit: limit,
        totalPages,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders.');
    }
  }


  async updateOrderStatus(
    id: string,
    vendorId: string,
    updateOrderStatusDto: UpdateOrderStatusDto
  ): Promise<Order> {
    try {
      const { status } = updateOrderStatusDto;

      // Fetch the order with its transaction ID
      const order = await this.orderModel.findOne({
        _id: id,
      });

      if (!order) {
        throw new NotFoundException('Order not found');
      }

      // Check authorization
      if (order.vendorId.toString() !== vendorId) {
        throw new UnauthorizedException('You are not authorized to update this order');
      }

      // Fetch the transaction using the transactionId from the order
      const transaction = await this.transactionModel.findById(order.transactionId);

      if (!transaction) {
        throw new NotFoundException('Transaction not found');
      }

      // Check payment status
      if (transaction.status !== PaymentStatusEnum.SUCCESSFUL) {
        throw new BadRequestException('Payment not confirmed yet');
      }

      // Prepare the update object based on the new status
      const update: Partial<Order> = { status };

      // Switch case to validate and set the correct status
      switch (status) {
        case OrderStatusEnum.CONFIRMED:
          if (order.status !== OrderStatusEnum.PENDING) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.PENDING}`);
          }
          update.status = OrderStatusEnum.CONFIRMED;
          break;

        case OrderStatusEnum.DECLINED:
          if (order.status !== OrderStatusEnum.PENDING) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.PENDING}`);
          }
          update.status = OrderStatusEnum.DECLINED;
          break;

        case OrderStatusEnum.PROCESSING:
          if (order.status !== OrderStatusEnum.CONFIRMED) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.CONFIRMED}`);
          }
          update.status = OrderStatusEnum.PROCESSING;
          break;

        case OrderStatusEnum.READY_TO_SHIP:
          if (order.status !== OrderStatusEnum.PROCESSING) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.PROCESSING}`);
          }
          update.status = OrderStatusEnum.READY_TO_SHIP;
          break;

        case OrderStatusEnum.SHIPPED:
          if (order.status !== OrderStatusEnum.READY_TO_SHIP) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.READY_TO_SHIP}`);
          }
          update.status = OrderStatusEnum.SHIPPED;
          break;

        case OrderStatusEnum.DELIVERED:
          if (order.status !== OrderStatusEnum.SHIPPED) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.SHIPPED}`);
          }
          update.status = OrderStatusEnum.DELIVERED;
          break;

        case OrderStatusEnum.RETURNED:
          if (order.status !== OrderStatusEnum.DELIVERED) {
            throw new BadRequestException(`Order status should be ${OrderStatusEnum.DELIVERED}`);
          }
          update.status = OrderStatusEnum.RETURNED;
          break;

        default:
          throw new BadRequestException('Invalid Status');
      }

      // Update the order status
      const updatedOrder = await this.orderModel.findByIdAndUpdate(
        { _id: id },
        update,
        { new: true } // Return the updated document
      );

      if (!updatedOrder) {
        throw new NotFoundException('Order not found for update');
      }

      return updatedOrder;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw new BadRequestException(error.message);
    }
  }


  async trackOder(orderId: string): Promise<Order> {
    try {
      const order = await this.orderModel.findOne({

        id: orderId

      })

      if (!order) throw new NotFoundException(`Order not found`)

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }



  async UpdateOrderStatus(reference: string) {


    try {
      const updatedOrder = await this.orderModel.findOneAndUpdate(
        { reference: reference },
        { $set: { status: 'PAID' } },
        { new: true }
      )

      if (!updatedOrder) throw new NotFoundException('Order Not found')


      return { updatedOrder, reference }
    } catch (error) {
      throw new BadRequestException('Failed to update this order');
    }

  }


  // async confirmTransactionStatus(
  //   transactionId: string,
  //   userId: string,
  //   confirmTransactionStatusDto: ConfirmTransactionStatusDto
  // ) {
  //   try {
  //     if (!transactionId || !userId) throw new BadRequestException('Invalid parameters.');

  //     const orderTransaction = await this.transactionModel.findOne({ _id: transactionId });

  //     if (!orderTransaction) throw new NotFoundException('Order not found');

  //     if (orderTransaction.status !== PaymentStatusEnum.PENDING)
  //       throw new BadRequestException(`This Payment has already been confirmed: ${orderTransaction.status}`);

  //     const { paymentGateway, paymentReference } = confirmTransactionStatusDto;

  //     let response;

  //     switch (paymentGateway) {
  //       case PaymentGatewayEnums.HYDROGENPAY:
  //         // Check for transaction status
  //         response = await this.hydrogenPayService.confirmTransaction({
  //           transactionRef: paymentReference,
  //           amount: orderTransaction.amount, // Passing this for testing purposes
  //         });

  //         break;

  //       default:
  //         await this.transactionModel.findOneAndUpdate({ _id: transactionId }, {
  //           $set: {
  //             paymentGateway,
  //             paymentReference,
  //           },
  //         });
  //         throw new BadRequestException('Gateway not supported');
  //     }

  //     if (!response.success) {
  //       await this.transactionModel.findOneAndUpdate({ _id: transactionId }, {
  //         $set: {
  //           paymentGateway,
  //           paymentReference,
  //         },
  //       });
  //       throw new BadRequestException(response.error || 'An Error Occurred');
  //     }

  //     if (response?.data?.amount !== orderTransaction.amount) {
  //       await this.transactionModel.findOneAndUpdate({ _id: transactionId }, {
  //         $set: {
  //           paymentGateway,
  //           paymentReference,
  //         },
  //       });

  //       throw new UnprocessableEntityException('Transaction Mismatch, Kindly contact support');
  //     }

  //     const update = {
  //       status: response.data.status,
  //       paymentGateway,
  //       paymentReference,
  //     };

  //     await this.transactionModel.findOneAndUpdate({ _id: transactionId }, update);

  //     return {
  //       message: `Payment ${response.data.status}`,
  //     };
  //   } catch (error) {
  //     throw new BadRequestException(error.message);
  //   }
  // }


}



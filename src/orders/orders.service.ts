import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { HelpersService } from '../utils/helpers/helpers.service';
import { CartService } from '../cart/cart.service';
import { OrderStatusEnum, PaymentGatewayEnums } from '../constants';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Order } from './schema/order.schema';
import { Cart } from 'src/cart/schema/cart.schema';
import { Product } from 'src/products/schema/product.schema';
import { Transaction } from 'src/transaction/schema/transaction.schema';
import { PaymentService } from 'src/payment/service/payments.service';
import { User } from 'src/user/schema/user.schema';
import { Vendor } from 'src/vendors/schema/vendor.schema';
import { LogisticService } from 'src/logistics/service/logistic.service';
import { SingleOrder } from './schema/singleOreder.schema';
import { NotificationService } from 'src/notification/notification.service';
import { CreateNotificationDataType } from 'src/notification/dto/notification.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cart.name) private cartModel: Model<Cart>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Vendor.name) private vendorModel: Model<Vendor>,
    @InjectModel(SingleOrder.name) private singleOrderModel: Model<SingleOrder>,

    private helper: HelpersService,
    private cartService: CartService,
    private readonly paymentService: PaymentService,
    private readonly logisticService: LogisticService,
    private readonly notificationService: NotificationService,
  ) {}

  // async create(createOrderDto: CreateOrderDto, userId: string) {
  //   try {
  //     const {
  //       shippingAddress,
  //       billingAddress,
  //       shippingMethod,
  //       personalInfo,
  //       products,
  //       shippingFee,
  //       paymentGateway,
  //     } = createOrderDto;

  //     // Validate products and check availability
  //     const productDetails = await Promise.all(
  //       products.map(async (item) => {
  //         const product = await this.productModel.findById(item.productId);
  //         if (!product) {
  //           throw new NotFoundException(
  //             `Product with ID ${item.productId} not found`,
  //           );
  //         }
  //         if (product.quantity - product.soldQuantity < item.quantity) {
  //           throw new BadRequestException(
  //             `Insufficient quantity for product ID ${item.productId}`,
  //           );
  //         }

  //         const sellingPrice = item.sellingPrice || product.sellingPrice;
  //         if (sellingPrice === undefined) {
  //           throw new BadRequestException(
  //             `Selling price is not defined for product ID ${item.productId}`,
  //           );
  //         }

  //         return {
  //           product,
  //           quantity: item.quantity,
  //           discount: item.discount || 0,
  //           vendorId: product.vendor,
  //           sellingPrice,
  //         };
  //       }),
  //     );

  //     //const vendorState = await this.vendorModel.findById(vendorIds);

  //     const userInfo = await this.userModel.findById(userId);
  //     if (!userInfo)
  //       throw new NotFoundException(
  //         'Please login or create an Account with us',
  //       );

  //     // Calculate total product amount considering discounts
  //     const totalProductAmount = productDetails
  //       .map((item) => {
  //         const discountAmount =
  //           (item.discount / 100) * item.product.sellingPrice * item.quantity; // Calculate discount
  //         const discountedPrice =
  //           item.product.sellingPrice * item.quantity - discountAmount; // Apply discount
  //         return discountedPrice;
  //       })
  //       .reduce((a, b) => a + b, 0);

  //     // Calculate VAT (7% of total product amount)
  //     const vat = parseFloat((totalProductAmount * 0.07).toFixed(2)); // Ensure VAT is a valid decimal

  //     const amount = parseFloat(
  //       (totalProductAmount + vat + shippingFee).toFixed(2),
  //     );

  //     const transaction = await this.transactionModel.create({
  //       reference: this.helper.genString(15, '1234567890'),
  //       paymentGateway,
  //       totalProductAmount: amount,
  //       shippingFee,
  //       amount,
  //       vat,
  //     });

  //     // Create the order with vendorId from the products
  //     const order = await this.orderModel.create({
  //       userId,
  //       shippingAddress,
  //       billingAddress,
  //       personalInfo,
  //       shippingMethod,
  //       shippingFee,
  //       paymentGateway,
  //       vat,
  //       reference: transaction.reference,
  //       transactionId: transaction._id,
  //       totalAmount: amount,
  //       products: productDetails.map((item) => ({
  //         productId: item.product.id,
  //         quantity: item.quantity,
  //         discount: item.discount,
  //         vendorId: item.vendorId,
  //       })),
  //     });

  //     // Payment processing logic...
  //     const paymentResponse = await this.processPayment(order, userInfo);

  //     // Update soldQuantity and check inStock status
  //     await Promise.all(
  //       productDetails.map(async (item) => {
  //         await this.productModel.findByIdAndUpdate(
  //           { _id: item.product._id },
  //           {
  //             $inc: { soldQuantity: item.quantity },
  //             $set: {
  //               inStock:
  //                 item.product.quantity -
  //                   (item.product.soldQuantity + item.quantity) >
  //                 0,
  //             },
  //           },
  //         );
  //       }),
  //     );

  //     // Prepare single orders for insertion
  //     const vendorOrdersMap = new Map();

  //     for (const item of productDetails) {
  //       const vendorId = item.vendorId;
  //       if (!vendorOrdersMap.has(vendorId)) {
  //         vendorOrdersMap.set(vendorId, {
  //           vendorId: vendorId,
  //           orderId: order._id,
  //           userId: userId,
  //           shippingAddress: shippingAddress,
  //           deliveryStatus: OrderStatusEnum.PENDING,
  //           products: [],
  //           totalAmount: 0, // Initialize totalAmount for the vendor order
  //         });
  //       }

  //       const vendorOrder = vendorOrdersMap.get(vendorId);
  //       const productAmount = item.sellingPrice * item.quantity; // Calculate product amount
  //       vendorOrder.products.push({
  //         productId: item.product.id,
  //         quantity: item.quantity,
  //         amount: productAmount, // Set the amount for the product
  //       });
  //       vendorOrder.totalAmount += productAmount; // Update totalAmount for the vendor order
  //     }

  //     // Check if an existing order for the vendor already exists
  //     for (const vendorOrder of vendorOrdersMap.values()) {
  //       const existingOrder = await this.singleOrderModel.findOne({
  //         vendorId: vendorOrder.vendorId,
  //       });

  //       if (existingOrder) {
  //         // If an existing order is found, update it with new products
  //         existingOrder.products.push(...vendorOrder.products);
  //         existingOrder.totalAmount += vendorOrder.totalAmount; // Update total amount
  //         await existingOrder.save(); // Save the updated order
  //       } else {
  //         // If no existing order, create a new one
  //         await this.singleOrderModel.create(vendorOrder);
  //       }
  //     }
  //     return {
  //       order,
  //       paymentResponse,
  //     };
  //   } catch (error) {
  //     console.log('THE ERROR', error);
  //     throw new BadRequestException(error.message);
  //   }
  // }
  async calculateTotalWeight(
    products: { productId: string; quantity: number }[],
  ): Promise<number> {
    try {
      const totalWeight = await Promise.all(
        products.map(async (item) => {
          const product = await this.productModel.findById(item.productId);
          if (!product) {
            throw new NotFoundException(
              `Product with ID ${item.productId} not found`,
            );
          }
          return product.weight * item.quantity;
        }),
      );

      return totalWeight.reduce((sum, weight) => sum + weight, 0);
    } catch (error) {
      console.error('Error calculating total weight:', error.message);
      throw new BadRequestException('Error calculating total weight');
    }
  }

  async create(createOrderDto: CreateOrderDto, userId: string) {
    try {
      const {
        shippingAddress,
        billingAddress,
        shippingMethod,
        products,
        shippingFee,
        paymentGateway,
      } = createOrderDto;

      const productDetails = await this.validateAndFetchProducts(products);
      const userInfo = await this.validateUser(userId);
      const totalProductAmount =
        this.calculateTotalProductAmount(productDetails);
      const vat = this.calculateVAT(totalProductAmount);

      const totalVendorPrice = await this.calculateTotalProductAmountForVendor(
        productDetails,
      );
      const amount = this.calculateTotalAmount(
        totalProductAmount,
        vat,
        shippingFee,
      );

      const transaction = await this.createTransaction(
        paymentGateway,
        amount,
        shippingFee,
        vat,
      );

      const personalInfo = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
      };

      // Create the order with vendorId from the products
      const order = await this.orderModel.create({
        userId,
        shippingAddress,
        billingAddress,
        personalInfo,
        shippingMethod,
        price: totalVendorPrice,
        shippingFee,
        paymentGateway,
        vat,
        reference: transaction.reference,
        transactionId: transaction._id,
        totalAmount: amount,
        products: productDetails.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          discount: item.discount,
          vendorId: item.vendorId,
        })),
      });

      const [paymentResponse, vendorOrders] = await Promise.all([
        this.processPayment(order, userInfo),

        this.handleVendorOrders(
          productDetails,
          order._id,
          userId,
          shippingAddress,
          totalProductAmount,
        ),
        this.updateProductQuantities(productDetails),
      ]);

      await Promise.all(
        vendorOrders.map((vendorOrder) => {
          const notificationData: CreateNotificationDataType = {
            message: 'A new order has been created for your account.',
            receiverId: vendorOrder.vendorId,
          };

          return this.notificationService.createNotification(notificationData);
        }),
      );

      return {
        order,
        paymentResponse,
      };
    } catch (error) {
      console.log('THE ERROR', error);
      throw new BadRequestException(error.message);
    }
  }

  // Helper Functions

  async validateAndFetchProducts(products) {
    return Promise.all(
      products.map(async (item) => {
        const product = await this.productModel.findById(item.productId);
        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }
        if (product.quantity - product.soldQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient quantity for product ID ${item.productId}`,
          );
        }

        const sellingPrice = item.sellingPrice || product.sellingPrice;
        if (sellingPrice === undefined) {
          throw new BadRequestException(
            `Selling price is not defined for product ID ${item.productId}`,
          );
        }

        return {
          product,
          quantity: item.quantity,
          discount: item.discount || 0,
          vendorId: product.vendor,
          sellingPrice,
        };
      }),
    );
  }

  async validateUser(userId: string) {
    const userInfo = await this.userModel.findById(userId);
    if (!userInfo) {
      throw new NotFoundException('Please login or create an Account with us');
    }
    return userInfo;
  }

  calculateTotalProductAmountForVendor(productDetails) {
    return productDetails
      .map((item) => {
        const discountAmount =
          (item.discount / 100) * item.product.price * item.quantity;
        return item.product.price * item.quantity - discountAmount;
      })
      .reduce((a, b) => a + b, 0);
  }

  calculateTotalProductAmount(productDetails) {
    return productDetails
      .map((item) => {
        const discountAmount =
          (item.discount / 100) * item.product.sellingPrice * item.quantity;
        return item.product.sellingPrice * item.quantity - discountAmount;
      })
      .reduce((a, b) => a + b, 0);
  }

  calculateVAT(totalProductAmount) {
    return parseFloat((totalProductAmount * 0.07).toFixed(2));
  }

  calculateTotalAmount(totalProductAmount, vat, shippingFee) {
    return parseFloat((totalProductAmount + vat + shippingFee).toFixed(2));
  }

  async createTransaction(paymentGateway, amount, shippingFee, vat) {
    return await this.transactionModel.create({
      reference: this.helper.genString(15, '1234567890'),
      paymentGateway,
      totalProductAmount: amount,
      shippingFee,
      amount,
      vat,
    });
  }

  async updateProductQuantities(productDetails) {
    await Promise.all(
      productDetails.map(async (item) => {
        await this.productModel.findByIdAndUpdate(
          { _id: item.product._id },
          {
            $inc: { soldQuantity: item.quantity },
            $set: {
              inStock:
                item.product.quantity -
                  (item.product.soldQuantity + item.quantity) >
                0,
            },
          },
        );
      }),
    );
  }
  async handleVendorOrders(
    productDetails,
    orderId,
    userId,
    shippingAddress,
    price, // Accept price parameter here
  ) {
    const vendorOrders = [];

    // Group product details by vendor
    const productsByVendor = productDetails.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = {
          vendorId: item.vendorId,
          orderId: orderId,
          userId: userId,
          shippingAddress: shippingAddress,
          deliveryStatus: OrderStatusEnum.PENDING,
          products: [],
          totalAmount: 0,
          price: 0, // Initialize price field
        };
      }

      const productAmount = item.product.sellingPrice * item.quantity;
      acc[item.vendorId].products.push({
        productId: item.product.id,
        quantity: item.quantity,
        amount: productAmount,
      });
      acc[item.vendorId].totalAmount += productAmount;

      // Assign price for each vendor (you might adjust this logic if necessary)
      acc[item.vendorId].price = price;

      return acc;
    }, {});

    // Create vendor orders
    for (const vendorOrder of Object.values(productsByVendor)) {
      const createdOrder = await this.singleOrderModel.create(vendorOrder);
      vendorOrders.push(createdOrder);
    }

    return vendorOrders;
  }

  // Separate method for payment processing
  private async processPayment(order: Order, userInfo: User) {
    const HydrogenPaymentData = {
      amount: order.totalAmount,
      email: userInfo.email,
      customerName: userInfo.firstName,
      currency: 'NGN',
      transactionRef: order.reference,
      callback: process.env.HYDROGRENPAY_CALLBACK,
    };

    const PaystackPaymentData = {
      amount: order.totalAmount,
      email: userInfo.email,
      reference: order.reference,
      callback: process.env.PAYSTACK_CALLBACK,
    };

    let paymentResponse;

    switch (order.paymentGateway) {
      case PaymentGatewayEnums.HYDROGENPAY:
        paymentResponse = await this.paymentService.createPayment(
          HydrogenPaymentData,
        );
        break;

      case PaymentGatewayEnums.PAYSTACK:
        paymentResponse = await this.paymentService.initializePayment(
          PaystackPaymentData,
        );
        break;

      default:
        throw new BadRequestException('Unsupported payment gateway');
    }

    return paymentResponse;
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

  async fetchVendorMyOrders(vendorId: string) {
    try {
      // Ensure limit and page are positive integers

      // Fetch paginated documents
      const orders = await this.orderModel
        .find({ vendorId })

        .populate('userId')
        .populate('transactionId')
        .populate('products.productId')
        .exec();

      // Count total number of documents with the filter

      return {
        data: orders,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders.');
    }
  }

  async fetchMyOrders(userId: string) {
    try {
      const orders = await this.singleOrderModel
        .find({ userId })

        .populate('userId')
        .populate('products.productId')
        .exec();

      return {
        count: orders.length,
        data: orders,
      };
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw new BadRequestException('Failed to fetch orders.');
    }
  }

  async listOneOrder(orderId: string, userId: string) {
    try {
      const order = await this.singleOrderModel
        .findOne({ _id: orderId, userId: userId })
        .populate('userId')
        .populate('products.productId')
        .exec();

      if (!order) throw new NotFoundException(`Order not found`);

      return order;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to fetch order.');
    }
  }

  // async updateOrderStatus(
  //   id: string,
  //   vendorId: string,
  //   updateOrderStatusDto: UpdateOrderStatusDto,
  // ): Promise<Order> {
  //   try {
  //     const { deliveryStatus } = updateOrderStatusDto;

  //     // Fetch the order with its transaction ID
  //     const order = await this.orderModel.findOne({
  //       _id: id,
  //     });

  //     if (!order) {
  //       throw new NotFoundException('Order not found');
  //     }

  //     // Check authorization
  //     if (order.vendorId.toString() !== vendorId) {
  //       throw new UnauthorizedException(
  //         'You are not authorized to update this order',
  //       );
  //     }

  //     // Fetch the transaction using the transactionId from the order
  //     const transaction = await this.transactionModel.findById(
  //       order.transactionId,
  //     );

  //     if (!transaction) {
  //       throw new NotFoundException('Transaction not found');
  //     }

  //     // Check payment status
  //     if (transaction.status !== PaymentStatusEnum.SUCCESSFUL) {
  //       throw new BadRequestException('Payment not confirmed yet');
  //     }

  //     // Prepare the update object based on the new status
  //     const update: Partial<Order> = { deliveryStatus };

  //     // Switch case to validate and set the correct status
  //     switch (deliveryStatus) {
  //       case OrderStatusEnum.CONFIRMED:
  //         if (order.deliveryStatus !== OrderStatusEnum.PENDING) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.PENDING}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.CONFIRMED;
  //         break;

  //       case OrderStatusEnum.DECLINED:
  //         if (order.deliveryStatus !== OrderStatusEnum.PENDING) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.PENDING}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.DECLINED;
  //         break;

  //       case OrderStatusEnum.PROCESSING:
  //         if (order.deliveryStatus !== OrderStatusEnum.CONFIRMED) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.CONFIRMED}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.PROCESSING;
  //         break;

  //       case OrderStatusEnum.READY_TO_SHIP:
  //         if (order.deliveryStatus !== OrderStatusEnum.PROCESSING) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.PROCESSING}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.READY_TO_SHIP;
  //         break;

  //       case OrderStatusEnum.SHIPPED:
  //         if (order.deliveryStatus !== OrderStatusEnum.READY_TO_SHIP) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.READY_TO_SHIP}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.SHIPPED;
  //         break;

  //       case OrderStatusEnum.DELIVERED:
  //         if (order.deliveryStatus !== OrderStatusEnum.SHIPPED) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.SHIPPED}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.DELIVERED;
  //         break;

  //       case OrderStatusEnum.RETURNED:
  //         if (order.deliveryStatus !== OrderStatusEnum.DELIVERED) {
  //           throw new BadRequestException(
  //             `Order status should be ${OrderStatusEnum.DELIVERED}`,
  //           );
  //         }
  //         update.deliveryStatus = OrderStatusEnum.RETURNED;
  //         break;

  //       default:
  //         throw new BadRequestException('Invalid Status');
  //     }

  //     // Update the order status
  //     const updatedOrder = await this.orderModel.findByIdAndUpdate(
  //       { _id: id },
  //       update,
  //       { new: true }, // Return the updated document
  //     );

  //     if (!updatedOrder) {
  //       throw new NotFoundException('Order not found for update');
  //     }

  //     return updatedOrder;
  //   } catch (error) {
  //     console.error('Error updating order status:', error);
  //     throw new BadRequestException(error.message);
  //   }
  // }

  async trackOder(orderId: string): Promise<Order> {
    try {
      const order = await this.orderModel.findOne({
        _id: orderId,
      });

      if (!order) throw new NotFoundException(`Order not found`);

      return order;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateOrderStatusPay(reference: string) {
    try {
      const updatedOrder = await this.orderModel.findOneAndUpdate(
        { reference: reference },
        { $set: { status: 'PAID' } },
        { new: true },
      );

      if (!updatedOrder) {
        throw new NotFoundException('Order not found');
      }

      await this.singleOrderModel.updateMany(
        { orderId: updatedOrder._id },
        { $set: { status: 'PAID' } },
      );

      return updatedOrder;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Failed to update the order');
    }
  }

  async getOrderByRef(reference: string) {
    try {
      const order = await this.orderModel.findOne({ reference: reference });
      console.log(order);

      if (!order) throw new NotFoundException(`Order not found`);

      return order;
    } catch (error) {
      console.error(error);
      // Handle specific error cases
      if (error instanceof NotFoundException) {
        throw error; // Re-throw if it's a NotFoundException
      }
      throw new BadRequestException('Failed to get the order');
    }
  }
}

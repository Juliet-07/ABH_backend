import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Dropshipping } from '../schema/dropshipping.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDropShippingDto } from '../dto/dropshipping.dto';
import { PaymentService } from 'src/payment/service/payments.service';
import { OrderStatusEnum, PaymentGatewayEnums } from 'src/constants';
import { User } from 'src/user/schema/user.schema';
import { Product } from 'src/products/schema/product.schema';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { Subscription } from 'src/subscription/schema/subscription.schema';
import { Transaction } from 'src/transaction/schema/transaction.schema';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SingleDropshipping } from '../schema/singledropshipping.schema';
import { Inventory } from '../schema/inventory.schema';

@Injectable()
export class DropshippingService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly hydroVerify: string;
  private readonly paystackUrl: string =
    'https://api.paystack.co/transaction/initialize';
  private readonly paystackSect: string;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Dropshipping.name)
    private dropshippingModel: Model<Dropshipping>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(SingleDropshipping.name)
    private singleDropshippingModel: Model<SingleDropshipping>,

    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,

    private readonly paymentService: PaymentService,
    private helper: HelpersService,
  ) {
    this.apiKey = this.configService.get<string>('HYDROGRENPAY_PUB_KEY');
    this.apiUrl = this.configService.get<string>('HYDROGRENPAY_URL');
    this.hydroVerify = this.configService.get<string>(
      'HYDROGRENPAY_VERIFY_URL',
    );
    this.paystackSect = this.configService.get<string>('PAY_STACK_SCT_KEY');
  }

  async create(payload: CreateDropShippingDto, userId: string) {
    try {
      const { products, paymentGateway, subscriptionDetails } = payload;

      const productDetails = await this.validateAndFetchProducts(products);
      const userInfo = await this.validateUser(userId);

      const totalProductAmount =
        this.calculateTotalProductAmount(productDetails);
      const vat = this.calculateVAT(totalProductAmount);

      const amount = this.calculateTotalAmount(
        totalProductAmount,
        vat,
        subscriptionDetails.amount,
      );
      if (isNaN(amount)) {
        throw new BadRequestException('Calculated total amount is invalid');
      }

      const transaction = await this.createTransaction(
        paymentGateway,
        amount,
        vat,
      );

      const personalInfo = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
      };

      // Create the order with vendorId from the products
      const dropshipping = await this.dropshippingModel.create({
        userId,
        subscriptionDetails,
        paymentGateway,
        personalInfo,
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

      // Payment processing logic...

      if (
        !subscriptionDetails ||
        typeof subscriptionDetails !== 'object' ||
        !subscriptionDetails.plan ||
        !subscriptionDetails.amount
      ) {
        throw new BadRequestException(
          'Subscription details are incomplete or malformed.',
        );
      }

      await this.subscriptionModel.create({
        userId,
        plan: subscriptionDetails.plan,
        amount: subscriptionDetails.amount,
        startDate: new Date(),
        endDate: this.calculateEndDate(subscriptionDetails.plan),
        reference: transaction.reference,
        paymentGateway: dropshipping.paymentGateway,
      });

      await this.updateProductQuantities(productDetails);
      const [paymentResponse] = await Promise.all([
        this.processPayment(dropshipping, userInfo),
        this.handleVendorOrders(productDetails, dropshipping._id, userId),
        this.createUserInventory(productDetails, dropshipping.id, userId),
      ]);

      return {
        dropshipping,
        paymentResponse,
      };
    } catch (error) {
      console.log('THE ERROR', error);
      throw new BadRequestException(error.message);
    }
  }

  async listDropshipping(userId: string) {
    try {
      const dropshipping = await this.singleDropshippingModel.find({
        userId: userId,
      });

      return dropshipping || null;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }

  private async createUserInventory(
    productDetails: any[],
    dropshippingId: string,
    userId: string,
  ) {
    for (const item of productDetails) {
      await this.inventoryModel.create({
        productId: item.product.id,
        vendorId: item.vendorId,
        userId: userId,
        quantity: item.quantity,
        quantityShipped: 0,
        quantityLeft: item.quantity,
        dropshippingId: dropshippingId,
      });
    }
  }

  async myInventories(userId: string) {
    try {
      const inventories = await this.inventoryModel.find({ userId: userId });

      return inventories || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async handleVendorOrders(productDetails, dropshippingId, userId) {
    const singleDropshippingOrders = [];

    // Group products by vendor
    const productsByVendor = productDetails.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = {
          vendorId: item.vendorId,
          dropshippingId: dropshippingId,
          userId: userId,
          deliveryStatus: OrderStatusEnum.PENDING,
          products: [],
          totalAmount: 0,
        };
      }

      const productAmount = item.sellingPrice * item.quantity;
      acc[item.vendorId].products.push({
        productId: item.product.id,
        quantity: item.quantity,
        amount: productAmount,
      });
      acc[item.vendorId].totalAmount += productAmount;

      return acc;
    }, {});

    // Create separate SingleDropshippingOrders for each vendor
    for (const vendorOrder of Object.values(productsByVendor)) {
      const createdOrder = await this.singleDropshippingModel.create(
        vendorOrder,
      );
      singleDropshippingOrders.push(createdOrder);
    }

    return singleDropshippingOrders;
  }

  async updateDropshippingPayment(reference: string) {
    try {
      const result = await this.dropshippingModel.findOneAndUpdate(
        { reference: reference },
        { $set: { status: 'PAID' } },
        { new: true },
      );

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error verifying Dropshipping transaction`);
    }
  }

  private async processPayment(dropshipping: Dropshipping, userInfo: User) {
    const HydrogenPaymentData = {
      amount: dropshipping.totalAmount,
      email: userInfo.email,
      customerName: userInfo.firstName,
      currency: 'NGN',
      transactionRef: dropshipping.reference,
      callback: 'abh.oritsetech.online/payments/verify',
    };

    const PaystackPaymentData = {
      amount: dropshipping.totalAmount,
      email: userInfo.email,
      reference: dropshipping.reference,
      callback: 'abh.oritsetech.online/payments/verify',
    };

    let paymentResponse;

    switch (dropshipping.paymentGateway) {
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

  async verifyDropshippingTransaction(TransactionRef: string) {
    try {
      const response = await axios.post(
        this.hydroVerify,
        { TransactionRef: TransactionRef },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (
        response.data.data.status === 'Paid' ||
        response.data.data.transactionStatus === 'Paid'
      ) {
        const result = await this.dropshippingModel.findOneAndUpdate(
          { reference: TransactionRef },
          { $set: { status: 'PAID' } },
          { new: true },
        );

        await this.transactionModel.findOneAndUpdate(
          { reference: TransactionRef },
          { $set: { status: 'PAID' } },
        );

        await this.singleDropshippingModel.updateMany(
          { orderId: result._id },
          { $set: { status: 'PAID' } },
        );
      } else {
        return { message: 'Payment verification failed' };
      }
    } catch (error) {
      console.error(
        'Error verifying Dropshipping transaction:',
        error.response ? error.response.data : error.message,
      );
      throw new BadRequestException(
        'Failed to verify Dropshipping transaction',
      );
    }
  }

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

  calculateTotalAmount(totalProductAmount, vat, subAmount) {
    return parseFloat((totalProductAmount + vat + subAmount).toFixed(2));
  }

  async createTransaction(paymentGateway, amount, vat) {
    return await this.transactionModel.create({
      reference: this.helper.genString(15, '1234567890'),
      paymentGateway,
      totalProductAmount: amount,
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

  // Helper method to calculate end date based on subscription type
  private calculateEndDate(type: string): Date {
    const startDate = new Date();
    let endDate: Date;

    switch (type) {
      case 'DAILY':
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 1);
        break;
      case 'WEEKLY':
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
        break;
      case 'MONTHLY':
        endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + 1);
        break;
      default:
        throw new BadRequestException('Invalid subscription type');
    }

    return endDate;
  }
}

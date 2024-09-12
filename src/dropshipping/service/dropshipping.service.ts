import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Dropshipping } from '../schema/dropshipping.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateDropShippingDto } from '../dto/dropshipping.dto';
import { PaymentService } from 'src/payment/service/payments.service';
import { PaymentGatewayEnums } from 'src/constants';
import { User } from 'src/user/schema/user.schem';
import { Product } from 'src/products/schema/product.schema';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { Subscription } from 'src/subscription/schema/subscription.schema';
import { Transaction } from 'src/transaction/schema/transaction.schema';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { SingleDropshipping } from '../schema/singledropshipping.schema';

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
    private SingleDropshippingModel: Model<SingleDropshipping>,

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

  //   async create(payload: CreateDropShippingDto, userId: string) {
  //      try {
  //        const {
  //          shippingAddress,
  //          billingAddress,
  //          shippingMethod,
  //          personalInfo,
  //          products,
  //          shippingFee,
  //          paymentGateway,
  //          subscriptionDetails,
  //        } = payload;

  //        // Validate products and check availability
  //        const productDetails = await Promise.all(
  //          products.map(async (item) => {
  //            const product = await this.productModel.findById(item.productId);
  //            if (!product) {
  //              throw new NotFoundException(`Product with ID ${item.productId} not found`);
  //            }
  //            if (product.quantity - product.soldQuantity < item.quantity) {
  //              throw new BadRequestException(`Insufficient quantity for product ID ${item.productId}`);
  //            }
  //            return {
  //              product,
  //              quantity: item.quantity,
  //              discount: item.discount || 0,
  //              vendorId: product.vendor,
  //            };
  //          }),
  //        );

  //        const userInfo = await this.userModel.findById(userId);
  //        if (!userInfo) {
  //          throw new NotFoundException('Please login or create an Account with us');
  //        }

  //        // Calculate total product amount considering discounts
  //        let totalProductAmount = productDetails
  //          .map((item) => {
  //            const discountAmount = (item.discount / 100) * item.product.sellingPrice * item.quantity;
  //            const discountedPrice = item.product.sellingPrice * item.quantity - discountAmount;
  //            return discountedPrice;
  //          })
  //          .reduce((a, b) => a + b, 0);

  //        // Calculate VAT (7% of total product amount)
  //        const vat = parseFloat((totalProductAmount * 0.07).toFixed(2));

  //        // Check for active subscription
  //        const checkSub = await this.subscriptionModel.findOne({
  //          userId: userId,
  //          status: 'ACTIVE',
  //        });

  //        // If the user has no active subscription but provides subscriptionDetails, add the subscription fee
  //        if (!checkSub && subscriptionDetails && subscriptionDetails.amount) {
  //          totalProductAmount += subscriptionDetails.amount; // Add subscription fee
  //        } else if (!checkSub && (!subscriptionDetails || !subscriptionDetails.amount)) {
  //          // If no active subscription and no subscriptionDetails provided
  //      //     throw new NotFoundException(`You don't have an active subscription. Please select a subscription and continue.`);
  //        }

  //        // Calculate total amount including VAT and shipping fee
  //        const amount = parseFloat((totalProductAmount + vat + Number(shippingFee)).toFixed(2));
  //        const ref = await this.helper.genString(15, '1234567890');
  //        const transaction = await this.transactionModel.create({
  //          reference: ref,
  //          paymentGateway,
  //          totalProductAmount: amount,
  //          shippingFee: Number(shippingFee),
  //          amount,
  //          vat,
  //        });

  //        // Create the dropshipping order
  //        const dropshipping = await this.dropshippingModel.create({
  //          userId,
  //          shippingAddress,
  //          billingAddress,
  //          personalInfo,
  //          shippingMethod,
  //          shippingFee,
  //          paymentGateway,
  //          vat,
  //          reference: ref,
  //          transactionId: transaction._id,
  //          totalAmount: amount,
  //          products: productDetails.map((item) => ({
  //            productId: item.product._id,
  //            quantity: item.quantity,
  //            discount: item.discount,
  //            vendorId: item.vendorId,
  //          })),
  //        });

  //        // Create subscription if it was added
  //        if (!checkSub && subscriptionDetails) {
  //          const subscriptionData = await this.subscriptionModel.create({
  //            userId,
  //            amount: subscriptionDetails.amount,
  //            type: subscriptionDetails.type,
  //            startDate: new Date(),
  //            endDate: this.calculateEndDate(subscriptionDetails.type),
  //            reference: ref,
  //          });
  //        }

  //        // Payment processing logic...
  //        const paymentResponse = await this.processPayment(dropshipping, userInfo);

  //        // Update soldQuantity and check inStock status
  //        await Promise.all(
  //          productDetails.map(async (item) => {
  //            await this.productModel.findByIdAndUpdate(
  //              { _id: item.product._id },
  //              {
  //                $inc: { soldQuantity: item.quantity },
  //                $set: {
  //                  inStock: item.product.quantity - (item.product.soldQuantity + item.quantity) > 0,
  //                },
  //              },
  //            );
  //          }),
  //        );

  //        return {
  //          dropshipping,
  //          paymentResponse,
  //        };
  //      } catch (error) {
  //        console.log('THE ERROR', error);
  //        throw new BadRequestException(error.message);
  //      }
  //    }
  // async create(payload: CreateDropShippingDto, userId: string) {
  //      try {
  //        const {
  //          shippingAddress,
  //          billingAddress,
  //          shippingMethod,
  //          personalInfo,
  //          products,
  //          shippingFee,
  //          paymentGateway,
  //        } = payload;

  //        // Validate products and check availability
  //        const productDetails = await Promise.all(
  //          products.map(async (item) => {
  //            const product = await this.productModel.findById(item.productId);
  //            if (!product) {
  //              return { error: `Product with ID ${item.productId} not found` };
  //            }
  //            if (product.quantity - product.soldQuantity < item.quantity) {
  //              return { error: `Insufficient quantity for product ID ${item.productId}` };
  //            }
  //            return {
  //              product,
  //              quantity: item.quantity,
  //              discount: item.discount || 0,
  //              vendorId: product.vendor,
  //            };
  //          }),
  //        );

  //        const userInfo = await this.userModel.findById(userId);
  //        if (!userInfo) {
  //          return { error: 'Please login or create an Account with us' };
  //        }

  //        // Filter out any errors from product validation
  //        const productErrors = productDetails.filter(item => item.error);
  //        if (productErrors.length > 0) {
  //          return { errors: productErrors.map(item => item.error) };
  //        }

  //        // Calculate total product amount considering discounts
  //        let totalProductAmount = productDetails
  //          .map((item) => {
  //            const discountAmount = (item.discount / 100) * item.product.sellingPrice * item.quantity; // Calculate discount
  //            const discountedPrice = item.product.sellingPrice * item.quantity - discountAmount; // Apply discount
  //            return discountedPrice;
  //          })
  //          .reduce((a, b) => a + b, 0);

  //        // Calculate VAT (7% of total product amount)
  //        const vat = parseFloat((totalProductAmount * 0.07).toFixed(2)); // Ensure VAT is a valid decimal

  //        // Check for active subscription
  //        const checkSub = await this.subscriptionModel.findOne({
  //          userId: userId,
  //          status: 'ACTIVE', // Check for active subscription
  //        });

  //        if (!checkSub && !payload.subscriptionDetails) {
  //          return { error: "You don't have an active subscription. Please select a subscription and continue." };
  //        }

  //        // If the user has an active subscription, add the subscription fee
  //        if (checkSub && payload.subscriptionDetails?.amount) {
  //          totalProductAmount += payload.subscriptionDetails.amount; // Use fee from subscriptionDetails if available
  //          console.log(payload.subscriptionDetails)
  //        } else if (!checkSub && payload.subscriptionDetails?.amount) {
  //          // Add subscription fee if no active subscription
  //          totalProductAmount += payload.subscriptionDetails.amount;
  //        }

  //        // Calculate total amount including VAT and shipping fee
  //        const amount = parseFloat((totalProductAmount + vat + Number(shippingFee)).toFixed(2));
  //        const ref = await this.helper.genString(15, '1234567890');
  //        const transaction = await this.transactionModel.create({
  //          reference: ref,
  //          paymentGateway,
  //          totalProductAmount: amount,
  //          shippingFee: Number(shippingFee),
  //          amount,
  //          vat,
  //        });

  //        // Create the order with vendorId from the products
  //        const dropshipping = await this.dropshippingModel.create({
  //          userId,
  //          shippingAddress,
  //          billingAddress,
  //          personalInfo,
  //          shippingMethod,
  //          shippingFee,
  //          paymentGateway,
  //          vat,
  //          reference: ref,
  //          transactionId: transaction._id,
  //          totalAmount: amount,
  //          products: productDetails.map((item) => ({
  //            productId: item.product._id,
  //            quantity: item.quantity,
  //            discount: item.discount,
  //            vendorId: item.vendorId, // Include vendorId in the order
  //          })),
  //        });

  //        // Create subscription data if applicable
  //        if (!checkSub && payload.subscriptionDetails?.amount) {
  //          await this.subscriptionModel.create({
  //            userId,
  //            amount: payload.subscriptionDetails.amount,
  //            type: payload.subscriptionDetails.type,
  //            startDate: new Date(),
  //            endDate: this.calculateEndDate(payload.subscriptionDetails.type),
  //            reference: ref,
  //          });
  //        }

  //        // Payment processing logic...
  //        const paymentResponse = await this.processPayment(dropshipping, userInfo);

  //        // Update soldQuantity and check inStock status
  //        await Promise.all(
  //          productDetails.map(async (item) => {
  //            await this.productModel.findByIdAndUpdate(
  //              { _id: item.product._id },
  //              {
  //                $inc: { soldQuantity: item.quantity },
  //                $set: {
  //                  inStock: item.product.quantity - (item.product.soldQuantity + item.quantity) > 0,
  //                },
  //              },
  //            );
  //          }),
  //        );

  //        return {
  //          dropshipping,
  //          paymentResponse,
  //          // subscriptionData, // Uncomment if you want to return subscription data
  //        };
  //      } catch (error) {
  //        console.log('THE ERROR', error);
  //        return { error: error.message };
  //      }
  //    }

  async create(payload: CreateDropShippingDto, userId: string) {
    try {
      const {
        shippingAddress,
        billingAddress,
        shippingMethod,
        personalInfo,
        products,
        shippingFee,
        paymentGateway,
      } = payload;
  
      // Validate required fields
      if (!shippingAddress) {
        throw new BadRequestException('Shipping address is required');
      }
  
      const productDetails = await this.validateAndFetchProducts(products);
      const userInfo = await this.validateUser(userId);
      const totalProductAmount = this.calculateTotalProductAmount(productDetails);
      const vat = this.calculateVAT(totalProductAmount);
  
      // Log values for debugging
      console.log('Total Product Amount:', totalProductAmount);
      console.log('VAT:', vat);
      console.log('Shipping Fee:', shippingFee);
  
      // Ensure all values are valid numbers
      if (isNaN(totalProductAmount) || isNaN(vat) || isNaN(shippingFee)) {
        throw new BadRequestException('Invalid values for total amount calculation');
      }
  
      const amount = this.calculateTotalAmount(totalProductAmount, vat, shippingFee);
      if (isNaN(amount)) {
        throw new BadRequestException('Calculated total amount is invalid');
      }
  
      const transaction = await this.createTransaction(paymentGateway, amount, shippingFee, vat);
  
      // Create the order with vendorId from the products
      const dropshipping = await this.dropshippingModel.create({
        userId,
        shippingAddress,
        billingAddress,
        personalInfo,
        shippingMethod,
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
  
      // Payment processing logic...
      const paymentResponse = await this.processPayment(dropshipping, userInfo);
  
      await this.updateProductQuantities(productDetails);
      await this.handleVendorOrders(productDetails, dropshipping._id, userId, shippingAddress);
  
      return {
        dropshipping,
        paymentResponse,
      };
    } catch (error) {
      console.log('THE ERROR', error);
      throw new BadRequestException(error.message);
    }
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

        await this.SingleDropshippingModel.updateMany(
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

  //   const subscriptionData =  await this.subscriptionModel.create({
  //      userId,
  //      amount: payload.subscriptionDetails.amount,
  //      type: payload.subscriptionDetails.type,
  //      startDate: new Date(),
  //      endDate: this.calculateEndDate(payload.subscriptionDetails.type),
  //      reference: ref,
  //    });

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

  async handleVendorOrders(productDetails, orderId, userId, shippingAddress) {
    const vendorOrdersMap = new Map();

    for (const item of productDetails) {
      const vendorId = item.vendorId;
      if (!vendorOrdersMap.has(vendorId)) {
        vendorOrdersMap.set(vendorId, {
          vendorId: vendorId,
          orderId: orderId,
          userId: userId,
          shippingAddress: shippingAddress,
          products: [],
          totalAmount: 0,
        });
      }

      const vendorOrder = vendorOrdersMap.get(vendorId);
      const productAmount = item.sellingPrice * item.quantity;
      vendorOrder.products.push({
        productId: item.product.id,
        quantity: item.quantity,
        amount: productAmount,
      });
      vendorOrder.totalAmount += productAmount;
    }

    for (const vendorOrder of vendorOrdersMap.values()) {
      const existingOrder = await this.SingleDropshippingModel.findOne({
        vendorId: vendorOrder.vendorId,
      });

      if (existingOrder) {
        existingOrder.products.push(...vendorOrder.products);
        existingOrder.totalAmount += vendorOrder.totalAmount;
        await existingOrder.save();
      } else {
        await this.SingleDropshippingModel.create(vendorOrder);
      }
    }
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



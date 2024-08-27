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
import { PaymentGatewayEnums, SubscriptionTypeEnum } from 'src/constants';
import { User } from 'src/user/schema/user.schem';
import { Transaction } from 'typeorm';
import { Product } from 'src/products/schema/product.schema';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { SubscriptionService } from 'src/subscription/service/subscription.service';
import { Subscription } from 'src/subscription/schema/subscription.schema';

@Injectable()
export class DropshippingService {
  constructor(
    @InjectModel(Dropshipping.name)
    private dropshippingModel: Model<Dropshipping>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,

    private readonly paymentService: PaymentService,
    private helper: HelpersService,
    private subscriptionService: SubscriptionService,
  ) {}

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

      // Validate products and check availability
      const productDetails = await Promise.all(
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
          return {
            product,
            quantity: item.quantity,
            discount: item.discount || 0,
            vendorId: product.vendor,
          };
        }),
      );

      const userInfo = await this.userModel.findById(userId);
      if (!userInfo)
        throw new NotFoundException(
          'Please login or create an Account with us',
        );

      // Calculate total product amount considering discounts
      let totalProductAmount = productDetails
        .map((item) => {
          const discountAmount =
            (item.discount / 100) * item.product.sellingPrice * item.quantity; // Calculate discount
          const discountedPrice =
            item.product.sellingPrice * item.quantity - discountAmount; // Apply discount
          return discountedPrice;
        })
        .reduce((a, b) => a + b, 0);

      await this.subscriptionModel.findOne({
        userId: userId,
        status: 'INACTIVE',
      });

      // Check if subscription details are provided
      if (payload.subscriptionDetails.amount) {
        const activeSubscription = await this.subscriptionModel.findOne({
          userId: userId,
          status: 'INACTIVE',
        });

        if (!activeSubscription) {
          throw new NotFoundException('Subscription not found');
        }
        // Add subscription fee or any other logic related to the subscription
        totalProductAmount += payload.subscriptionDetails?.amount || 0; // Use fee from subscriptionDetails if available
      }

      ///SubscriptionTypeEnum
      // Calculate VAT (7% of total product amount)
      const vat = parseFloat((totalProductAmount * 0.07).toFixed(2)); // Ensure VAT is a valid decimal

      // Calculate total amount including VAT and shipping fee
      const amount = parseFloat(
        (totalProductAmount + vat + Number(shippingFee)).toFixed(2),
      );
       const ref = await this.helper.genString(15, '1234567890')
      const transaction = await this.transactionModel.create({
        reference: ref,
        paymentGateway,
        totalProductAmount: amount,
        shippingFee: Number(shippingFee),
        amount,
        vat,
      });

      // Create the order with vendorId from the products
      const dropshipping = await this.dropshippingModel.create({
        userId,
        shippingAddress,
        billingAddress,
        personalInfo,
        shippingMethod,
        shippingFee,
        paymentGateway,
        //vendorId: item.vendorId,
        vat,
        reference: ref,
        transactionId: transaction._id,
        totalAmount: amount,
        products: productDetails.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          discount: item.discount,
          vendorId: item.vendorId, // Include vendorId in the order
        })),
      });

      await this.subscriptionModel.create({
        userId,
        amount,
        type: payload.subscriptionDetails.type,
        startDate: new Date(),
        endDate: this.calculateEndDate(payload.subscriptionDetails.type),
        reference: ref,
      });

      // Payment processing logic...
      const paymentResponse = await this.processPayment(dropshipping, userInfo);

      // Update soldQuantity and check inStock status
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

      return {
        dropshipping,
        paymentResponse,
      };
    } catch (error) {
      console.log('THE ERROR', error);
      throw new BadRequestException(error.message);
    }
  }

  private async processPayment(dropshipping: Dropshipping, userInfo: User) {
    const HydrogenPaymentData = {
      amount: dropshipping.totalAmount,
      email: userInfo.email,
      customerName: userInfo.firstName,
      currency: 'NGN',
      transactionRef: dropshipping.reference,
      callback: 'http://localhost:3000/about-us',
    };

    const PaystackPaymentData = {
      amount: dropshipping.totalAmount,
      email: userInfo.email,
      reference: dropshipping.reference,
      callback: 'http://localhost:3000/about-us',
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

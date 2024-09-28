import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { Shipping } from '../schema/shipment.schema.';
import { Inventory } from 'src/dropshipping/schema/inventory.schema';
import { ConfigService } from '@nestjs/config';
import { PaymentService } from 'src/payment/service/payments.service';
import { PaymentGatewayEnums } from 'src/constants';
import { User } from 'src/user/schema/user.schema';
import { CreateShippingDto } from '../dto/shipping.dto';
import { SingleShipping } from '../schema/singleshipment.schema';
import axios from 'axios';

@Injectable()
export class ShippingService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly hydroVerify: string;
  private readonly paystackUrl: string =
    'https://api.paystack.co/transaction/initialize';
  private readonly paystackSect: string;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Inventory.name) private inventoryModel: Model<Inventory>,
    @InjectModel(Shipping.name) private shippingModel: Model<Shipping>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(SingleShipping.name)
    private singleShippingModel: Model<SingleShipping>,

    private helper: HelpersService,
    private readonly paymentService: PaymentService,
  ) {
    this.apiKey = this.configService.get<string>('HYDROGRENPAY_PUB_KEY');
    this.apiUrl = this.configService.get<string>('HYDROGRENPAY_URL');
    this.hydroVerify = this.configService.get<string>(
      'HYDROGRENPAY_VERIFY_URL',
    );
    this.paystackSect = this.configService.get<string>('PAY_STACK_SCT_KEY');
  }

  async checkoutFromInventory(payload: CreateShippingDto, userId: string) {
    try {
      const { products, paymentGateway, shippingFee } = payload;

      // Validate and fetch product details from inventory
      const productDetails = await this.validateAndFetchProducts(
        products,
        userId,
      );

      // Validate user information
      const userInfo = await this.validateUser(userId);

      // Calculate VAT and total amount
      const vat = this.calculateVAT(shippingFee);
      const totalAmount = vat + shippingFee;

      // Prepare personal information
      const personalInfo = {
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        email: userInfo.email,
        phoneNumber: userInfo.phoneNumber,
      };

      // Create shipping record
      const shipping = await this.shippingModel.create({
        userId,
        vat,
        paymentGateway,
        totalAmount,
        reference: this.helper.genString(15, '1234567890'),
        products: productDetails.map((item) => {
          const quantityShipped = Number(item.quantityShipped);
          const quantityLeft = Number(item.quantityLeft);

          return {
            productId: item.product.id,
            quantityShipped,
            quantityLeft,
            vendorId: item.vendorId,
          };
        }),
        shippingAddress: payload.shippingAddress,
        personalInfo,
        shippingFee,
      });

      // Group products by vendor
      const groupedByVendor = this.groupProductsByVendor(productDetails);

      // Create a SingleShipping entry for each vendor
      await Promise.all([
        Object.keys(groupedByVendor).map(async (vendorId) => {
          const vendorProducts = groupedByVendor[vendorId];

          // Ensure products array matches schema
          const productsForShipping = vendorProducts.map((product) => ({
            productId: product.productId,
            quantityShipped: product.quantityShipped,
            quantityLeft: product.quantityLeft,
            vendorId: product.vendorId,
          }));

          // Create SingleShipping entry
          await this.singleShippingModel.create({
            userId,
            vendorId,
            shippingId: shipping._id,
            products: productsForShipping,
            paymentGateway,
            shippingFee,
            vat,
            totalAmount,
            reference: shipping.reference,
            shippingAddress: payload.shippingAddress,
            personalInfo,
          });
        }),
        // Process payment for the shipping
      ]);

      // Update inventory for each product
      await Promise.all(
        productDetails.map(async (item) => {
          try {
            const { product, quantityShipped, quantityLeft } = item;

            // Update the inventory
            const result = await this.inventoryModel.findOneAndUpdate(
              { productId: item.product.productId, userId: userId }, // Use item.product.id here
              {
                $set: {
                  quantityLeft: quantityLeft, // Quantity after shipping
                  quantityShipped: quantityShipped, // Total shipped quantity
                },
              },
              { new: true },
            );
            console.log('RESULT', result);
          } catch (error) {
            console.error(
              `Failed to update inventory for productId: ${item.product.productId}`,
              error,
            ); // Use item.product.id here
            throw new BadRequestException(
              `Failed to update inventory for productId: ${item.product.productId}`,
            ); // Use item.product.id here
          }
        }),
      );

      const paymentResponse = await this.processPayment(shipping, userInfo);

      return {
        shipping,
        paymentResponse,
      };
    } catch (error) {
      console.error('Checkout error:', error);
      throw new BadRequestException(
        'An error occurred during checkout. Please try again.',
      );
    }
  }

  async listShipping(userId: string) {
    try {
      const shippings = await this.shippingModel
        .find({ userId: userId })
        .populate({
          path: 'products.productId',
          model: 'Product',
        })
        .exec();
      return shippings || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateAndFetchProducts(products, userId) {
    return Promise.all(
      products.map(async (item) => {
        const product = await this.inventoryModel.findOne({
          productId: item.productId,
          userId: userId,
        });

        if (!product) {
          throw new NotFoundException(`Product not found`);
        }

        if (product.quantityLeft === 0) {
          throw new BadRequestException(
            `You no longer have a Product in your inventory`,
          );
        }

        if (item.quantity > product.quantityLeft) {
          throw new BadRequestException(`Insufficient product quantity`);
        }
        return {
          product,
          quantityShipped: item.quantity,
          quantityLeft: product.quantityLeft - item.quantity,
          vendorId: product.vendorId,
        };
      }),
    );
  }

  async updateDropshippingPayment(TransactionRef: string) {
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

      // Check if the transaction status is 'Paid'
      const isPaid =
        response.data.data.status === 'Paid' ||
        response.data.data.transactionStatus === 'Paid';

      if (isPaid) {
        // Update the dropshipping record status to 'PAID'

        const result = await this.shippingModel.findOneAndUpdate(
          { reference: TransactionRef },
          { $set: { status: 'PAID' } },
          { new: true },
        );

        if (!result) {
          throw new NotFoundException(`shipping not found`);
        }

        await this.singleShippingModel.updateMany(
          { shippingId: result._id },
          { $set: { status: 'PAID' } },
          { new: true },
        );

        return result;
      }
      return null;
    } catch (error) {
      console.log(error);
    }
  }

  async updateInventory(productDetails, userId) {
    await Promise.all(
      productDetails.map(async (item) => {
        const result = await this.inventoryModel.findOneAndUpdate(
          { productId: item.product.id, userId: userId },
          { quantityLeft: item.quantityLeft },
          { new: true },
        );
        console.log(
          `Updating productId: ${item.product.id} for userId: ${userId}`,
        );
        if (!result) {
          console.warn(
            `No inventory record found for productId: ${item.product.id} and userId: ${userId}`,
          );
        }
      }),
    );
  }

  private async processPayment(shipping: Shipping, userInfo: User) {
    const HydrogenPaymentData = {
      amount: shipping.totalAmount,
      email: userInfo.email,
      customerName: userInfo.firstName,
      currency: 'NGN',
      transactionRef: shipping.reference,
      callback: process.env.HYDROGRENPAY_CALLBACK,
    };

    const PaystackPaymentData = {
      amount: shipping.totalAmount,
      email: userInfo.email,
      reference: shipping.reference,
      callback: process.env.PAYSTACK_CALLBACK,
    };

    let paymentResponse;

    switch (shipping.paymentGateway) {
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

  async validateUser(userId: string) {
    const userInfo = await this.userModel.findById(userId);
    if (!userInfo) {
      throw new NotFoundException('Please login or create an Account with us');
    }
    return userInfo;
  }

  // Example method to calculate shipping fee
  private calculateVAT(shippingFee: number): number {
    return parseFloat((shippingFee * 0.07).toFixed(2));
  }

  // Group products by vendor
  groupProductsByVendor(productDetails) {
    return productDetails.reduce((acc, item) => {
      const { vendorId } = item;
      if (!acc[vendorId]) {
        acc[vendorId] = [];
      }
      acc[vendorId].push({
        productId: item.product.id,
        quantityShipped: item.quantityShipped,
        quantityLeft: item.quantityLeft,
        vendorId: item.vendorId,
      });
      return acc;
    }, {});
  }
}

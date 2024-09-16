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
      const productDetails = await this.validateAndFetchProducts(products);

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
          // Ensure these are numbers
          const quantityShipped = Number(item.quantityShipped);
          const quantityLeft = Number(item.quantityLeft);

          return {
            productId: item.product.id,
            quantityShipped, // Ensure this is a number
            quantityLeft, // Ensure this is a number
            vendorId: item.vendorId,
          };
        }),
        shippingAddress: payload.shippingAddress,
        personalInfo,
        shippingFee,
      });

      // Deduct quantities from inventory
      await this.updateInventory(productDetails);
      // Group products by vendor
      const groupedByVendor = this.groupProductsByVendor(productDetails);

      // Create a SingleShipping entry for each vendor
      const [paymentResponse] = await Promise.all([
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
        await this.processPayment(shipping, userInfo),
      ]);

      return {
        shipping,
        paymentResponse,
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async listShipping(userId: string) {
    try {
      const shippings = await this.shippingModel.find({ userId: userId });

      return shippings || null;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async validateAndFetchProducts(products) {
    return Promise.all(
      products.map(async (item) => {
        const product = await this.inventoryModel.findOne({
          productId: item.productId,
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

  async updateDropshippingPayment(reference: string) {
    try {
      const result = await this.shippingModel.findOneAndUpdate(
        { reference: reference },
        { $set: { status: 'PAID' } },
        { new: true },
      );

      if (!result) {
        throw new NotFoundException(`shipping not found`);
      }

      await this.singleShippingModel.updateMany(
        { userId: result.userId },
        { $set: { status: 'PAID' } },
        { new: true },
      );

      return result;
    } catch (error) {
      console.log(error);
      throw new BadRequestException(`Error verifying Dropshipping transaction`);
    }
  }

  async updateInventory(productDetails) {
    await Promise.all(
      productDetails.map(async (item) => {
        await this.inventoryModel.findByIdAndUpdate(item.product.id, {
          quantityLeft: item.quantityLeft,
        });
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
      callback: 'abh.oritsetech.online/payments/verify',
    };

    const PaystackPaymentData = {
      amount: shipping.totalAmount,
      email: userInfo.email,
      reference: shipping.reference,
      callback: 'abh.oritsetech.online/payments/verify',
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

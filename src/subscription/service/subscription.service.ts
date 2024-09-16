import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../schema/subscription.schema';
import { User } from 'src/user/schema/user.schema';
import { PaymentGatewayEnums, SubscriptionStatus } from 'src/constants';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Transaction } from 'src/transaction/schema/transaction.schema';
import { ConfigService } from '@nestjs/config';
import {
  CreatePaymentDto,
  CreatePayStackPaymentDto,
} from 'src/payment/dto/initiat.dto';
import axios from 'axios';
import { CreateSubscriptionDto } from '../dto/create.sub.dto';

@Injectable()
export class SubscriptionService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly hydroVerify: string;
  private readonly paystackUrl: string =
    'https://api.paystack.co/transaction/initialize';
  private readonly paystackSect: string;
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<Subscription>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,

    private readonly helper: HelpersService,
  ) {
    this.apiKey = this.configService.get<string>('HYDROGRENPAY_PUB_KEY');
    this.apiUrl = this.configService.get<string>('HYDROGRENPAY_URL');
    this.hydroVerify = this.configService.get<string>(
      'HYDROGRENPAY_VERIFY_URL',
    );
    this.paystackSect = this.configService.get<string>('PAY_STACK_SCT_KEY');
  }

  async createSubscription(userId: string, payload: CreateSubscriptionDto) {
    try {
      const { plan, amount, paymentGateway } = payload;
      console.log('Subscription plan:', plan); // Log the incoming type

      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

     

      const subscription = this.subscriptionModel.create({
        userId,
        plan,
        amount,
        reference: this.helper.genString(20),
        paymentGateway,
      });

      // const paymentResponse = await this.processPayment(
      //   await subscription,
      //   user,
      // );

      // Create transaction
      const transaction = await this.transactionModel.create({
        reference: (await subscription).reference,
        paymentGateway,
        totalProductAmount: amount,
        shippingFee: 0,
        amount,
        vat: 0,
      });

      return {
        subscription,
        //  paymentResponse,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException(error.message);
    }
  }

  private async processPayment(subscription: Subscription, userInfo: User) {
    const HydrogenPaymentData = {
      amount: subscription.amount,
      email: userInfo.email,
      customerName: userInfo.firstName,
      currency: 'NGN',
      transactionRef: subscription.reference,
      callback: 'http://localhost:3000/about-us',
    };

    const PaystackPaymentData = {
      amount: subscription.amount,
      email: userInfo.email,
      reference: subscription.reference,
      callback: 'http://localhost:3000/about-us',
    };

    let paymentResponse;

    switch (subscription.paymentGateway) {
      case PaymentGatewayEnums.HYDROGENPAY:
        paymentResponse = await this.createPayment(HydrogenPaymentData);
        break;

      case PaymentGatewayEnums.PAYSTACK:
        paymentResponse = await this.initializePayment(PaystackPaymentData);
        break;

      default:
        throw new BadRequestException('Unsupported payment gateway');
    }

    return paymentResponse;
  }

  async createPayment(paymentData: CreatePaymentDto): Promise<any> {
    try {
      const response = await axios.post(this.apiUrl, paymentData, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      return response.data;
    } catch (error) {
      console.error('THE ERROR', error);
      console.error(
        'Error creating payment with HydrogenPay:',
        error.response ? error.response.data : error.message,
      );
      throw new BadRequestException('Failed to create payment', error);
    }
  }

  async initializePayment(paymentData: CreatePayStackPaymentDto): Promise<any> {
    try {
      const response = await axios.post(`${this.paystackUrl}`, paymentData, {
        headers: {
          Authorization: `Bearer ${this.paystackSect}`,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Error initializing payment with Paystack:',
        error.response ? error.response.data : error.message,
      );
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  // async createSubscriptionDropShipping(
  //   userId: string,
  //   type: string,
  //   reference: string,
  //   amount: number
  // ): Promise<Subscription> {
  //   const user = await this.userModel.findById(userId);
  //   if (!user) {
  //     throw new NotFoundException('User not found');
  //   }

  //   const startDate = new Date();
  //   let endDate: Date;

  //   switch (type) {
  //     case 'DAILY':
  //       endDate = new Date(startDate);
  //       endDate.setDate(startDate.getDate() + 1);
  //       break;
  //     case 'WEEKLY':
  //       endDate = new Date(startDate);
  //       endDate.setDate(startDate.getDate() + 7);
  //       break;
  //     case 'MONTHLY':
  //       endDate = new Date(startDate);
  //       endDate.setMonth(startDate.getMonth() + 1);
  //       break;
  //     default:
  //       throw new BadRequestException('Invalid subscription type');
  //   }

  //   const subscription = new this.subscriptionModel({
  //     userId,
  //     type,
  //     amount,
  //     startDate,
  //     endDate,
  //     reference,
  //   });

  //   return subscription.save();
  // }

  async updateSubscriptionStatus(
    subscriptionId: string,
    status: string,
  ): Promise<Subscription> {
    const subscription = await this.subscriptionModel.findOne({
      subscriptionId,
    });
    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    const update = await this.subscriptionModel.findByIdAndUpdate(
      { _id: subscriptionId },
      { $set: { status: status } },
      { new: true },
    );

    return update;
  }

  async findOneSub(userId: string) {
    try {
      const sub = await this.subscriptionModel.findOne({ userId: userId });

      if (!sub) {
        throw new NotFoundException(`User dose not have a sub`);
      }
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async updateSubscriptionPay(reference: string) {
    try {
      const result = await this.subscriptionModel.findOneAndUpdate(
        { reference: reference },
        { $set: { status: 'ACTIVE' } },
        { new: true },
      );

      console.log(result);

      if (!result) {
        throw new NotFoundException('Subscription not found');
      }

      return result;
    } catch (error) {
      console.log(error);
    }
  }

  async checkAndDeactivateExpiredSubscriptions(): Promise<void> {
    const now = new Date();
    const expiredSubscriptions = await this.subscriptionModel.find({
      endDate: { $lt: now },
      status: 'ACTIVE',
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.INACTIVE;
      await subscription.save();
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    console.log('Cron job triggered');
    await this.checkAndDeactivateExpiredSubscriptions();
  }
}

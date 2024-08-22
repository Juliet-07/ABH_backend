import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import axios from 'axios';
import { CreatePaymentDto, CreatePayStackPaymentDto } from '../dto/initiat.dto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from 'src/orders/orders.service';
import { SubscriptionService } from 'src/subscription/service/subscription.service';
import { Transaction } from 'src/transaction/schema/transaction.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class PaymentService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly hydroVerify: string;
  private readonly paystackUrl: string = 'https://api.paystack.co/transaction/initialize';
  private readonly paystackSect: string;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrdersService)) private ordersService: OrdersService,
    @InjectModel(Transaction.name) private transactionModel: Model<Transaction>,
    private readonly subscriptionService: SubscriptionService
  ) {
    this.apiKey = this.configService.get<string>('HYDROGRENPAY_PUB_KEY');
    this.apiUrl = this.configService.get<string>('HYDROGRENPAY_URL');
    this.hydroVerify = this.configService.get<string>('HYDROGRENPAY_VERIFY_URL');
    this.paystackSect = this.configService.get<string>('PAY_STACK_SCT_KEY')


  }

  async createPayment(paymentData: CreatePaymentDto): Promise<any> {
    try {
      const response = await axios.post(
        this.apiUrl,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data;

    } catch (error) {
      console.error("THE ERROR", error)
      console.error('Error creating payment with HydrogenPay:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to create payment', error);
    }
  }


  async verifyOrderTransaction(transactionRef: string) {
    try {
      const response = await axios.post(this.hydroVerify,
        { TransactionRef: transactionRef },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

      if (response.data.data.status === 'Paid' || response.data.data.transactionStatus === 'Paid') {
        const order = await this.ordersService.updateOrderStatusPay(transactionRef);

        await this.transactionModel.findOneAndUpdate(
          { reference: transactionRef },
          { $set: { status: "SUCCESSFUL" } },
        );
        if (order) {
          return { message: 'Payment verified and order updated' };
        } else {
          throw new NotFoundException('Order not found');
        }
      } else {
        return { message: 'Payment verification failed' };
      }
    } catch (error) {
      console.error('Error verifying order transaction:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to verify order transaction');
    }
  }


  async verifySubscriptionTransaction(transactionRef: string) {
    try {
      const response = await axios.post(this.hydroVerify,
        { TransactionRef: transactionRef },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        });

      if (response.data.data.status === 'Paid' || response.data.data.transactionStatus === 'Paid') {
        const subscription = await this.subscriptionService.updateSubscriptionPay(transactionRef);
        if (subscription) {
          return { message: 'Payment verified and subscription updated' };
        } else {
          throw new NotFoundException('Subscription not found');
        }
      } else {
        return { message: 'Payment verification failed' };
      }
    } catch (error) {
      console.error('Error verifying subscription transaction:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to verify subscription transaction');
    }
  }



  async initializePayment(paymentData: CreatePayStackPaymentDto): Promise<any> {
    try {
      const response = await axios.post(
        `${this.paystackUrl}`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${this.paystackSect}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error initializing payment with Paystack:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to initialize payment');
    }
  }

  async verifyPayment(reference: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/transaction/verify/${reference}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error verifying payment with Paystack:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to verify payment');
    }
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { CreatePaymentDto, CreatePayStackPaymentDto } from '../dto/initiat.dto';
import { ConfigService } from '@nestjs/config';
import { OrdersService } from 'src/orders/orders.service';

@Injectable()
export class PaymentService {
  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly hydroVerify: string;
  private readonly paystackUrl: string = 'https://api.paystack.co/transaction/initialize';
  private readonly paystackSect: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly ordersService: OrdersService
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
      console.log("THE RESPONSE", response.data)
      return response.data;

    } catch (error) {
      console.error("THE ERROR", error)
      console.error('Error creating payment with HydrogenPay:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to create payment');
    }
  }


  async verifyTransaction(transactionRef: string) {
    try {
      const response = await axios.get(`${this.hydroVerify}/transactionRef`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        params: { TransactionRef: transactionRef }
      });

      console.log(response.data.status);

      if (response.data.status === 'success') {
        await this.ordersService.UpdateOrderStatus(transactionRef);
        return { message: 'Payment verified and order updated' };
      } else {
        return { message: 'Payment verification failed' };
      }

    } catch (error) {
      console.error('Error verifying transaction:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to verify transaction');
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

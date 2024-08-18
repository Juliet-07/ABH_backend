import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaymentStatusEnum } from '../../constants';
import { CreatePaymentDto } from './dto/createPay.dto';

@Injectable()
export class HydrogenpayService {  
    constructor(
        // private helper: HelpersService,
        private readonly apiKey = process.env.HYDROGRENPAY_API_TOKEN,
        private readonly apiUrl = process.env.HYDROGRENPAY_API_URL
    ) {

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
      console.error('Error creating payment with HydrogenPay:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to create payment');
    }
  }


  async getPaymentStatus(paymentId: string): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error getting payment status from HydrogenPay:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to get payment status');
    }
  }



    async confirmTransaction({ transactionRef, amount }) {
        try {
            // const response = await axios.post(`${process.env.HYDROGRENPAY_API_URL}/Merchant/confirm-payment`, {
            //     transactionRef
            // }, {
            //     headers: {
            //         'Content-Type': 'application/json',
            //         Authorization: `${process.env.HYDROGRENPAY_API_TOKEN}`
            //     }
            // }).then(this.helper.normalizeResponse).catch(this.helper.normalizeError)

            const response = {
                "statusCode": "90000",
                "message": "Operation Successful",
                "data": {
                    "id": "54b00000-35a7-6e3b-0119-08db9e496fe9",
                    "amount": amount || 100.00,
                    "chargedAmount": 100.00,
                    "currency": "NGN",
                    "customerEmail": "devetest@randomuser.com",
                    "narration": null,
                    "status": "Successful",
                    "transactionRef": "503002801229_6669939140",
                    "processorResponse": null,
                    "createdAt": "2023-08-16T11:10:45.0399497",
                    "paidAt": "2023-08-16T11:10:45.0399498",
                    "ip": null,
                    "paymentType": "BankTransfer",
                    "authorizationObject": null,
                    "fees": 0
                }
            }

            const { statusCode, message, data } = response;
            if (statusCode !== '90000') throw new Error(message || 'An Error Occurred while confirming payment')
            const status = data.status.toLowerCase()

            return {
                success: true,
                message,
                data: {
                    status: status === 'successful' ? PaymentStatusEnum.SUCCESSFUL : status === 'pending' ? PaymentStatusEnum.PENDING : PaymentStatusEnum.FAILED,
                    amount: data?.amount,
                }
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            }
        }

    }
}

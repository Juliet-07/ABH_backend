import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { GIGLogisticsAuthService } from './gig-logistics-auth.service';

@Injectable()
export class GIGLogisticsService {
  constructor(private readonly authService: GIGLogisticsAuthService) {}

  async getShippingPrice(shippingData: any): Promise<any> {
    try {
      // Authenticate if not already authenticated


      // if (!this.authService.getToken()) {
      //   await this.authService.authenticate();
      // }

      const token = await this.authService.authenticate()

      // const token = this.authService.getToken();
      console.log(token)
      const response = await axios.post(process.env.GIG_LOGISTICS_SHIPPING_PRICE_URL, shippingData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      
      return response.data;
    } catch (error) {
      console.error('Error getting shipping price from GIG Logistics:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Failed to get shipping price', error.message);
    }
  }
}

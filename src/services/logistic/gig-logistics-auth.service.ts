import { Injectable, BadRequestException } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GIGLogisticsAuthService {
  private token: string | null = null;

  async authenticate(): Promise<string> {
    try {
      const response = await axios.post(process.env.GIG_LOGISTICS_AUTH_URL, {
        username: process.env.GIG_LOGISTICS_USERNAME,
        password: process.env.GIG_LOGISTICS_PASSWORD,
        sessionObj: "string"
      });
      this.token = response.data.token;

      console.log(response)
      return this.token;
    } catch (error) {
      console.log(error)
      console.error('Error authenticating with GIG Logistics:', error.response ? error.response.data : error.message);
      throw new BadRequestException('Authentication failed');
    }
  }

  getToken(): string {
    if (!this.token) {
      throw new BadRequestException('Not authenticated. Please authenticate first.');
    }
    return this.token;
  }
}

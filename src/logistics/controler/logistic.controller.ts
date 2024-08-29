import { Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { LogisticService } from '../service/logistic.service';

@Controller('logistic')
export class LogisticController {
  constructor(private readonly logisticService: LogisticService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  auth() {
    return this.logisticService.getAuthToken();
  }

  @Get('states')
  async getStates() {
    const token = await this.logisticService.getAuthToken();
    if (token) {
      return await this.logisticService.fetchAvailableStates(token);
    }
    return { error: 'Unable to fetch states, authentication failed.' };
  }

  @Get('cities')
  async getCities() {
    const token = await this.logisticService.getAuthToken();
    if (token) {
      return await this.logisticService.fetchAllCities(token);
    }
    return { error: 'Unable to fetch cities, authentication failed.' };
  }


  @Get('state-cities')
  async getCitiesInState(@Query('stateName') stateName: string) {
    const token = await this.logisticService.getAuthToken();
    if (token) {
      return await this.logisticService.fetchCitiesInState(token, stateName);
    }
    return { error: 'Unable to fetch cities, authentication failed.' };
  }

  @Get('delivery-towns')
  async getDeliveryTowns(@Query('cityCode') cityCode: string) {
    const token = await this.logisticService.getAuthToken();
    if (token) {
      return await this.logisticService.fetchDeliveryTowns(token, cityCode);
    }
    return { error: 'Unable to fetch delivery towns, authentication failed.' };
  }

  @Post('delivery-fee')
  async calculateFee(@Query() payload: any) {
    const token = await this.logisticService.getAuthToken();
    if (token) {
      return await this.logisticService.calculateDeliveryFee(token, payload);
    }
    return { error: 'Unable to calculate delivery fee, authentication failed.' };
  }
}

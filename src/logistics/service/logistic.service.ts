import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class LogisticService {
  private readonly redstart_password: string;
  private readonly redstart_userName: string;
  private readonly tokenUrl = 'https://api.clicknship.com.ng/Token';
  private readonly statesUrl =
    'https://api.clicknship.com.ng/clicknship/Operations/States';
  private readonly citiesUrl =
    'https://api.clicknship.com.ng/clicknship/operations/cities';
  private readonly stateCitiesUrl =
    'https://api.clicknship.com.ng/clicknship/Operations/StateCities';
  private readonly deliveryTownsUrl =
    'https://api.clicknship.com.ng/clicknship/Operations/DeliveryTowns';
  private readonly deliveryFeeUrl =
    'https://api.clicknship.com.ng/clicknship/Operations/DeliveryFee';

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  constructor(private readonly configService: ConfigService) {
    this.redstart_password =
      this.configService.get<string>('RED_STAR_PASSWORD');
    this.redstart_userName =
      this.configService.get<string>('RED_STAR_USERNAME');
  }

  // username: 'cnsdemoapiacct',
  // password: 'ClickNShip$12345',

  // Method to obtain the auth token
  async getAuthToken(): Promise<string | undefined> {
    const requestBody = new URLSearchParams({
      username: this.redstart_userName,
      password: this.redstart_password,
      grant_type: 'password',
    }).toString();

    try {
      const response = await axios.post(this.tokenUrl, requestBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;

      return token; 
    } catch (error) {
      console.error(
        'Error obtaining token:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  // Method to fetch available states
  async fetchAvailableStates(token: string): Promise<any[] | undefined> {
    try {
      const response = await axios.get(this.statesUrl, {
        headers: {
          Authorization: `Bearer ${token}`, // Use Bearer token for authorization
          'Content-Type': 'application/json',
        },
      });

      const states = response.data; // Assuming response is an array of JSON objects
      console.log('Available States:', states);
      return states; // Return the states data for further use
    } catch (error) {
      console.error(
        'Error fetching available states:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  async fetchAllCities(token: string): Promise<any[] | undefined> {
    try {
      const response = await axios.get(this.citiesUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const cities = response.data;
      console.log('Available Cities:', cities);
      return cities;
    } catch (error) {
      console.error(
        'Error fetching cities:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  // Method to fetch cities in a specified state
  async fetchCitiesInState(
    token: string,
    stateName: string,
  ): Promise<any[] | { error: string }> {
    try {
      const response = await axios.get(
        `${this.stateCitiesUrl}?StateName=${encodeURIComponent(stateName)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const cities = response.data;
      console.log(`Cities in State ${stateName}:`, cities);

      return cities;
    } catch (error) {
      console.error(
        'Error fetching cities in state:',
        error.response ? error.response.data : error.message,
      );
      return { error: 'Failed to fetch cities in state. Please try again.' };
    }
  }

  // Method to fetch delivery towns based on city code
  async fetchDeliveryTowns(
    token: string,
    cityCode: string,
  ): Promise<any[] | { error: string }> {
    try {
      console.log(
        `Fetching delivery towns for city code: ${cityCode} with token: ${token}`,
      );
      const response = await axios.get(
        `${this.deliveryTownsUrl}?CityCode=${encodeURIComponent(cityCode)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const towns = response.data;
      console.log(`Delivery Towns for City Code ${cityCode}:`, towns);
      return towns;
    } catch (error) {
      console.error(
        'Error fetching delivery towns:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  // Method to calculate delivery fee
  async calculateDeliveryFee(
    token: string,
    payload: {
      Origin: string;
      Destination: string;
      Weight: number;
      PickupType?: string;
      OnforwardingTownID: string;
    },
  ): Promise<any | undefined> {
    try {
      console.log('Calculating delivery fee with payload:', payload);
      const response = await axios.post(this.deliveryFeeUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      // Log the full response for detailed inspection
      console.log('Full API Response:', response.data);

      // Check and log the response data type
      console.log('Response Data Type:', typeof response.data);

      // Extract and log the fee details
      const feeDetails = response.data;
      console.log('Fee Details:', feeDetails);

      // Verify if data is present and is an array
      if (Array.isArray(feeDetails)) {
        console.log('Data Array Length:', feeDetails.length);
        if (feeDetails.length > 0) {
          const { DeliveryFee, VatAmount, TotalAmount } = feeDetails[0];
          console.log('Delivery Fee:', DeliveryFee);
          console.log('VAT Amount:', VatAmount);
          console.log('Total Amount:', TotalAmount);
          return feeDetails;
        } else {
          console.log('Data array is empty.');
          return undefined;
        }
      } else {
        console.log('Response data is not an array or is missing.');
        return undefined;
      }
    } catch (error) {
      console.error(
        'Error calculating delivery fee:',
        error.response ? error.response.data : error.message,
      );
    }
  }
}

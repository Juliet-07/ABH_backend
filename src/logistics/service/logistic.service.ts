import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class LogisticService {
  private readonly tokenUrl = 'https://api.clicknship.com.ng/Token'; // Moved outside to class level
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
  constructor() {}

  // Method to obtain the auth token
  async getAuthToken(): Promise<string | undefined> {
    const requestBody = new URLSearchParams({
      username: 'cnsdemoapiacct', // Demo User
      password: 'ClickNShip$12345', // Demo Password
      grant_type: 'password',
    });

    try {
      const response = await axios.post(this.tokenUrl, requestBody, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token; // Assuming the token is returned in `access_token`
      console.log('Access Token:', token);
      return token; // Return the token for further use
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
  ) {
    try {
      const response = await axios.get(
        `${this.stateCitiesUrl}?StateName=${stateName}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const cities = response.data;
      console.log('CHECK', response);
      console.log(`Cities in State ${stateName}:`, cities);
      return cities;
    } catch (error) {
      console.error(
        'Error fetching cities in state:',
        error.response ? error.response.data : error.message,
      );
    }
  }

  // Method to fetch delivery towns based on city code
  async fetchDeliveryTowns(
    token: string,
    cityCode: string,
  ): Promise<any[] | undefined> {
    try {
      const response = await axios.get(
        `${this.deliveryTownsUrl}?CityCode=${cityCode}`,
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
      Weight: string;
      PickupType?: string; // Optional (1 for Pickup and 2 for DropOff)
      OnforwardingTownID?: string; // Optional if shipment with Onforwarding
    },
  ): Promise<any | undefined> {
    try {
      const response = await axios.post(this.deliveryFeeUrl, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const feeDetails = response.data;
      console.log('Delivery Fee Details:', feeDetails);
      return feeDetails;
    } catch (error) {
      console.error(
        'Error calculating delivery fee:',
        error.response ? error.response.data : error.message,
      );
    }
  }
}

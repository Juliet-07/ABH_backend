import { IsDefined } from "class-validator";

export class DeliveryEstimateDto {
    @IsDefined()
    street: string;
  
    @IsDefined()
    city: string;
  
    @IsDefined()
    state: string;
  
    @IsDefined()
    country: string;
}
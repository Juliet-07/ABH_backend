import { Module } from "@nestjs/common";
import { SubscriptionController } from "./controller/subscription.controller";
import { SubscriptionService } from "./service/subscription.service";
import { MongooseModule } from "@nestjs/mongoose";
import { UserSchema } from "src/user/schema/user.schem";
import { SubscriptionSchema } from "./schema/subscription.schema";
import { HelpersService } from "src/utils/helpers/helpers.service";
import { ScheduleModule } from "@nestjs/schedule";



@Module({
     imports: [
          ScheduleModule.forRoot(),
          MongooseModule.forFeature([
               { name: 'Subscription', schema: SubscriptionSchema },
               { name: 'User', schema: UserSchema },
          ])
     ],
     providers: [SubscriptionService, HelpersService],
     controllers: [SubscriptionController],
     exports: [SubscriptionService],
})
export class SubscriptionModule { }
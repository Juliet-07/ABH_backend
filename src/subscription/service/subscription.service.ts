import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from '../schema/subscription.schema';
import { User } from 'src/user/schema/user.schem';
import { SubscriptionStatus } from 'src/constants';
import { HelpersService } from 'src/utils/helpers/helpers.service';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class SubscriptionService {
     constructor(
          @InjectModel(Subscription.name) private subscriptionModel: Model<Subscription>,
          @InjectModel(User.name) private userModel: Model<User>,

          private helper: HelpersService,

     ) { }

     async createSubscription(userId: string, type: string): Promise<Subscription> {
          const user = await this.userModel.findById(userId);
          if (!user) {
               throw new NotFoundException('User not found');
          }

          const startDate = new Date();
          let endDate: Date;

          switch (type) {
               case 'DAILY':
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 1);
                    break;
               case 'WEEKLY':
                    endDate = new Date(startDate);
                    endDate.setDate(startDate.getDate() + 7);
                    break;
               case 'MONTHLY':
                    endDate = new Date(startDate);
                    endDate.setMonth(startDate.getMonth() + 1);
                    break;
               default:
                    throw new BadRequestException('Invalid subscription type');
          }

          const subscription = new this.subscriptionModel({
               userId,
               type,
               startDate,
               endDate,
               reference: this.helper.genString(20),
          });

          return subscription.save();
     }

     async updateSubscriptionStatus(subscriptionId: string, status: string): Promise<Subscription> {
          const subscription = await this.subscriptionModel.findById(subscriptionId);
          if (!subscription) {
               throw new NotFoundException('Subscription not found');
          }

          const update = await this.subscriptionModel.findByIdAndUpdate(
               { _id: subscriptionId },
               { $set: { status: status } },
               { new: true },
          );

          return update;
     }




     async checkAndDeactivateExpiredSubscriptions(): Promise<void> {
          const now = new Date();
          const expiredSubscriptions = await this.subscriptionModel.find({ endDate: { $lt: now }, status: 'ACTIVE' });

          for (const subscription of expiredSubscriptions) {
               subscription.status = SubscriptionStatus.INACTIVE;
               await subscription.save();
          }
     }


     @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) 
     async handleCron() {
          await this.checkAndDeactivateExpiredSubscriptions();
     }

}

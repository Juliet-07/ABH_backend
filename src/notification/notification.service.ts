import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateNotificationDataType, GetNotificationDataType, GetOneNotificationDataType } from './dto/notification.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from './schema/notification.schema'

@Injectable()
export class NotificationService {
     constructor(
          @InjectModel(Notification.name) private notificationModel: Model<Notification>,
     ) { }

     async createNotification(
          payload: CreateNotificationDataType
     ): Promise<Notification> {



          const data = await this.notificationModel.create(payload);


          return data;
     }


     async getNotificationsForReceiver(
          payload: GetNotificationDataType
     ): Promise<Notification[]> {
          try {
               const notifications = await this.notificationModel.find({

                    receiverId: payload.receiverId

               })

               return notifications;
          } catch (error) {
               throw new InternalServerErrorException(error.message)
          }
     }


     async getOneNotification(payload: GetOneNotificationDataType) {
          try {
               const { notificationId, receiverId } = payload;
               const notification = await this.notificationModel.findOne({

                    _id: notificationId,
                    receiverId: receiverId

               })

               return notification
          } catch (error) {
               throw new InternalServerErrorException(error.message)
          }
     }
}
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entity/notification.entity';
import { CreateNotificationDataType, GetNotificationDataType } from './dto/notification.dto';


@Injectable()
export class NotificationService {
     constructor(
          @InjectRepository(Notification)
          private notificationRepository: Repository<Notification>,
     ) { }

     async createNotification(
          payload: CreateNotificationDataType
     ): Promise<Notification> {
          const { message, receiverId } = payload;

          const notification = new Notification();
          notification.message = message;
          notification.receiverId = receiverId


          return this.notificationRepository.save(notification);
     }


     async getNotificationsForReceiver(
          payload: GetNotificationDataType
     ): Promise<Notification[]> {
          try {
               const notifications = await this.notificationRepository.find({
                    where: {
                         receiverId: payload.receiverId
                    }
               })

               return notifications;
          } catch (error) {
               throw new InternalServerErrorException(error.message)
          }
     }
}
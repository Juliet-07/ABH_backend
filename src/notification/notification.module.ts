import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { NotificationGateway } from './notification.gateway';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationSchema } from './schema/notification.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Notification', schema: NotificationSchema },])],
  controllers: [NotificationController],
  providers: [NotificationService, NotificationGateway]
})
export class NotificationModule {}

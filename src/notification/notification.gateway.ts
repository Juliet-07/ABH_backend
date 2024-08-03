import {
  Logger,
  Injectable,
} from '@nestjs/common';
import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { NotificationService } from './notification.service';
import { NotificationSocketEnum } from './socket.enum';
import { CreateNotificationDataType, GetNotificationDataType, GetOneNotificationDataType } from './dto/notification.dto';


@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: 'notification',
})
@Injectable()
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly notificationService: NotificationService) { }

  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  afterInit(server: Server) {
    this.logger.log('NotificationGateway Socket Connected and running');
    server.disconnectSockets();
  }

  @SubscribeMessage(NotificationSocketEnum.CREATE_NOTIFICATION)
  async handleCreateNotification(
    @MessageBody() payload: CreateNotificationDataType,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const createNotification = await this.notificationService.createNotification(payload);

      client.emit(
        NotificationSocketEnum.NOTIFICATION_CREATED,
        JSON.stringify({
          notification: createNotification,
        }),
      );
    } catch (error) {
      this.logger.error(`NotificationGateway.handleCreateNotification error: ${error.message}`);
    }
  }

  @SubscribeMessage(NotificationSocketEnum.LIST_ONE_NOTIFICATION)
  async handleGetNotificationsForReceiver(
    @MessageBody() payload: GetNotificationDataType,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const getNotification = await this.notificationService.getNotificationsForReceiver(payload);

      client.emit(
        NotificationSocketEnum.ONE_NOTIFICATION_LISTED,
        JSON.stringify({
          notification: getNotification,
        }),
      );
    } catch (error) {
      this.logger.error(`NotificationGateway.handleGetNotificationsForReceiver error: ${error.message}`);
    }
  }


  @SubscribeMessage(NotificationSocketEnum.LIST_NOTIFICATION)
  async handleGetOneNotification(
    @MessageBody() payload: GetOneNotificationDataType,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const listOneNotification = await this.notificationService.getOneNotification(payload);

      client.emit(
        NotificationSocketEnum.NOTIFICATION_LISTED,
        JSON.stringify({
          notification: listOneNotification,
        }),
      );
    } catch (error) {
      this.logger.error(`NotificationGateway.handleGetNotificationsForReceiver error: ${error.message}`);
    }
  }
}

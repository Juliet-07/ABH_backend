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
import { CreateNotificationDataType } from './dto/notification.dto';


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
}

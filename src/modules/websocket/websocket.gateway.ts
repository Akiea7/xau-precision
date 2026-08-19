import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // إرسال رسالة ترحيب وتأكيد الاتصال للواجهة
    client.emit('connection_status', { status: 'connected', message: 'Welcome to XAU Precision API' });
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  // دالة نستخدمها لاحقاً لبث الأسعار
  broadcastTick(tick: any) {
    this.server.emit('tick', tick);
  }
}

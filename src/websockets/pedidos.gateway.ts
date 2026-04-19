import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '@database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PedidosGateway
  implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, Set<string>>();

  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });

      client.data.userId = decoded.sub;
      client.data.userRole = decoded.role;

      // Registrar usuario conectado
      if (!this.connectedUsers.has(decoded.sub)) {
        this.connectedUsers.set(decoded.sub, new Set());
      }
      this.connectedUsers.get(decoded.sub)?.add(client.id);

      client.emit('connection_success', {
        message: 'Conectado al servidor de WebSocket',
      });
    } catch (error) {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      const userSockets = this.connectedUsers.get(client.data.userId);
      if (userSockets) {
        userSockets.delete(client.id);
        if (userSockets.size === 0) {
          this.connectedUsers.delete(client.data.userId);
        }
      }
    }
  }

  // Emitir cuando hay un nuevo pedido
  async emitirNuevoPedido(pedido: any) {
    this.server.emit('nuevo_pedido', {
      pedido,
      timestamp: new Date(),
    });
  }

  // Emitir cuando cambia el estado de un pedido
  async emitirCambioEstado(pedidoId: string, nuevoEstado: string) {
    this.server.emit('cambio_estado_pedido', {
      pedidoId,
      nuevoEstado,
      timestamp: new Date(),
    });
  }

  // Suscribirse a los cambios de un pedido específico
  @SubscribeMessage('suscribirse_pedido')
  handleSubscribePedido(client: Socket, data: { pedidoId: string }) {
    if (
      client.data.userRole === 'EMPLEADO' ||
      client.data.userRole === 'ADMIN'
    ) {
      client.join(`pedido_${data.pedidoId}`);
      client.emit('suscripcion_exitosa', {
        message: `Suscrito a los cambios del pedido ${data.pedidoId}`,
      });
    }
  }

  // Suscribirse a todos los pedidos (solo empleados y admin)
  @SubscribeMessage('suscribirse_todos_pedidos')
  handleSubscribeAllPedidos(client: Socket) {
    if (
      client.data.userRole === 'EMPLEADO' ||
      client.data.userRole === 'ADMIN'
    ) {
      client.join('todos_pedidos');
      client.emit('suscripcion_exitosa', {
        message: 'Suscrito a todos los pedidos',
      });
    }
  }

  // Notificar cambio de estado a todos los empleados
  async notificarCambioEstadoAEmpleados(
    pedidoId: string,
    nuevoEstado: string,
    pedido: any,
  ) {
    this.server.to('todos_pedidos').emit('actualizar_pedido', {
      pedidoId,
      nuevoEstado,
      pedido,
      timestamp: new Date(),
    });

    this.server.to(`pedido_${pedidoId}`).emit('actualizar_pedido', {
      pedidoId,
      nuevoEstado,
      pedido,
      timestamp: new Date(),
    });
  }
}

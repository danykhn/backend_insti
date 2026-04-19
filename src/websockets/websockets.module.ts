import { Module } from '@nestjs/common';
import { PedidosGateway } from './pedidos.gateway';
import { PrismaService } from '@database/prisma.service';

@Module({
  providers: [PedidosGateway, PrismaService],
  exports: [PedidosGateway],
})
export class WebSocketsModule {}

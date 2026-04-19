import { Module } from '@nestjs/common';
import { PedidosService } from './pedidos.service';
import { PedidosController } from './pedidos.controller';
import { PrismaService } from '@database/prisma.service';
import { WebSocketsModule } from '@websockets/websockets.module';

@Module({
  imports: [WebSocketsModule],
  providers: [PedidosService, PrismaService],
  controllers: [PedidosController],
  exports: [PedidosService],
})
export class PedidosModule {}

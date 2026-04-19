import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigurationModule } from '@config/config.module';
import { AuthModule } from '@auth/auth.module';
import { UsersModule } from '@users/users.module';
import { CartillasModule } from '@cartillas/cartillas.module';
import { PedidosModule } from '@pedidos/pedidos.module';
import { PagosModule } from '@pagos/pagos.module';
import { WebSocketsModule } from '@websockets/websockets.module';
import { DatosBancariosModule } from '@datos-bancarios/datos-bancarios.module';
import { PrismaService } from '@database/prisma.service';

@Module({
  imports: [
    ConfigurationModule,
    AuthModule,
    UsersModule,
    CartillasModule,
    PedidosModule,
    PagosModule,
    WebSocketsModule,
    DatosBancariosModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

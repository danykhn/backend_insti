import { Module } from '@nestjs/common';
import { PagosService } from './pagos.service';
import { PagosController } from './pagos.controller';
import { PrismaService } from '@database/prisma.service';

@Module({
  providers: [PagosService, PrismaService],
  controllers: [PagosController],
  exports: [PagosService],
})
export class PagosModule {}

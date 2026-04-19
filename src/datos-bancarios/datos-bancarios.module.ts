import { Module } from '@nestjs/common';
import { DatosBancariosService } from './datos-bancarios.service';
import { DatosBancariosController } from './datos-bancarios.controller';
import { PrismaService } from '@database/prisma.service';

@Module({
  controllers: [DatosBancariosController],
  providers: [DatosBancariosService, PrismaService],
  exports: [DatosBancariosService],
})
export class DatosBancariosModule {}
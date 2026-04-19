import { Module } from '@nestjs/common';
import { CartillasService } from './cartillas.service';
import { CartillasController } from './cartillas.controller';
import { PrismaService } from '@database/prisma.service';

@Module({
  providers: [CartillasService, PrismaService],
  controllers: [CartillasController],
  exports: [CartillasService],
})
export class CartillasModule {}

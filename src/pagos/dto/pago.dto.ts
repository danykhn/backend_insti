import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class RegistrarPagoTransferenciaDto {
  @IsString()
  pedidoId: string;

  @IsString()
  id_comprobante: string;

  @IsDateString()
  fecha_transferencia: string;

  @IsString()
  @IsOptional()
  comprobante_url?: string; // URL del archivo subido
}

export class RegistrarPagoEfectivoDto {
  @IsString()
  pedidoId: string;

  @IsString()
  @IsOptional()
  entregado_por?: string;
}

export class VerificarPagoDto {
  @IsString()
  paymentId: string;

  @IsString()
  estado: 'verificado' | 'rechazado';

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class PaymentResponseDto {
  id: string;
  pedidoId: string;
  usuarioId: string;
  metodo: PaymentMethod;
  monto: number;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
}

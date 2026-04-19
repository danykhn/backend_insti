import { IsString, IsNumber, IsArray, IsEnum, IsOptional } from 'class-validator';
import { CartillaStatus, PaymentMethod } from '@prisma/client';

export class ArticuloCarritoDto {
  @IsString()
  cartillaId: string;

  @IsNumber()
  cantidad: number;
}

export class CreatePedidoDto {
  @IsArray()
  articulos: ArticuloCarritoDto[];

  @IsEnum(PaymentMethod)
  metodo_pago: PaymentMethod;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class UpdatePedidoEstadoDto {
  @IsEnum(CartillaStatus)
  estado: CartillaStatus;

  @IsString()
  @IsOptional()
  observaciones?: string;
}

export class PedidoResponseDto {
  id: string;
  numeroOrden: string;
  usuarioId: string;
  estado: CartillaStatus;
  metodo_pago: PaymentMethod;
  cantidad_total: number;
  precio_total: number;
  observaciones: string | null;
  createdAt: Date;
  updatedAt: Date;
}

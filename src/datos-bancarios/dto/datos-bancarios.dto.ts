import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDatosBancariosDto {
  @ApiProperty({
    example: 'mi_cuenta_bancaria',
    description: 'Alias de la cuenta',
  })
  @IsString()
  @IsNotEmpty()
  alias: string;

  @ApiProperty({
    example: '1234567890123456789012',
    description: 'CBU único de la cuenta',
  })
  @IsString()
  @IsNotEmpty()
  cbu: string;

  @ApiProperty({
    example: '1234567890',
    description: 'Número de cuenta',
  })
  @IsString()
  @IsNotEmpty()
  numeroCuenta: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del titular de la cuenta',
  })
  @IsString()
  @IsNotEmpty()
  titular: string;

  @ApiProperty({
    example: 'Banco Galicia',
    description: 'Nombre del banco',
  })
  @IsString()
  @IsNotEmpty()
  nombreBanco: string;
}

export class UpdateDatosBancariosDto {
  @ApiPropertyOptional({
    example: 'mi_cuenta_bancaria',
    description: 'Alias de la cuenta',
  })
  @IsString()
  @IsOptional()
  alias?: string;

  @ApiPropertyOptional({
    example: '1234567890123456789012',
    description: 'CBU único de la cuenta',
  })
  @IsString()
  @IsOptional()
  cbu?: string;

  @ApiPropertyOptional({
    example: '1234567890',
    description: 'Número de cuenta',
  })
  @IsString()
  @IsOptional()
  numeroCuenta?: string;

  @ApiPropertyOptional({
    example: 'Juan Pérez',
    description: 'Nombre del titular de la cuenta',
  })
  @IsString()
  @IsOptional()
  titular?: string;

  @ApiPropertyOptional({
    example: 'Banco Galicia',
    description: 'Nombre del banco',
  })
  @IsString()
  @IsOptional()
  nombreBanco?: string;
}

export class DatosBancariosResponseDto {
  @ApiProperty({
    example: 'cuid123',
    description: 'ID único',
  })
  id: string;

  @ApiProperty({
    example: 'mi_cuenta_bancaria',
  })
  alias: string;

  @ApiProperty({
    example: '1234567890123456789012',
  })
  cbu: string;

  @ApiProperty({
    example: '1234567890',
  })
  numeroCuenta: string;

  @ApiProperty({
    example: 'Juan Pérez',
  })
  titular: string;

  @ApiProperty({
    example: 'Banco Galicia',
  })
  nombreBanco: string;

  @ApiProperty({
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2024-01-15T10:00:00Z',
  })
  updatedAt: Date;
}
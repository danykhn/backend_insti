import { IsString, IsNumber, IsOptional, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCartillaDto {
  @ApiProperty({
    example: 'Cálculo I',
  })
  @IsString()
  titulo: string;

  @ApiPropertyOptional({
    example: 'Cartilla de cálculo diferencial e integral',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    example: 'Juan González',
  })
  @IsString()
  autor: string;

  @ApiProperty({
    example: 'Matemáticas',
  })
  @IsString()
  materia: string;

  @ApiProperty({
    example: 'Ingeniería en Sistemas',
  })
  @IsString()
  carrera: string;

  @ApiProperty({
    example: 25.50,
    type: Number,
  })
  @IsNumber()
  precio: number;

  @ApiPropertyOptional({
    example: 100,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  cantidad?: number;

  @ApiPropertyOptional({
    example: 'https://example.com/cartilla.jpg',
  })
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiPropertyOptional({
    example: ['etiqueta-id-1', 'etiqueta-id-2'],
    type: [String],
  })
  @IsArray()
  @IsOptional()
  etiquetas?: string[];
}

export class UpdateCartillaDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  titulo?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  autor?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  materia?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  carrera?: string;

  @ApiPropertyOptional({
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  precio?: number;

  @ApiPropertyOptional({
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  cantidad?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  imagen?: string;

  @ApiPropertyOptional({
    type: [String],
  })
  @IsArray()
  @IsOptional()
  etiquetas?: string[];
}

export class CreateEtiquetaDto {
  @ApiProperty({
    example: 'semestre-1',
  })
  @IsString()
  nombre: string;

  @ApiPropertyOptional({
    example: 'Cartillas del primer semestre',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;
}

export class CartillaFilterDto {
  @IsString()
  @IsOptional()
  materia?: string;

  @IsString()
  @IsOptional()
  carrera?: string;

  @IsString()
  @IsOptional()
  autor?: string;

  @IsString()
  @IsOptional()
  etiqueta?: string;
}

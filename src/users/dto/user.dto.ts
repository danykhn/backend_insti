import { IsEmail, IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email único del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombre del usuario',
  })
  @IsString()
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellido del usuario',
  })
  @IsString()
  lastName: string;

  @ApiPropertyOptional({
    enum: ['ADMIN', 'EMPLEADO', 'CURSANTE'],
    default: 'CURSANTE',
    description: 'Rol del usuario',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class UpdateUserDto {
  @ApiPropertyOptional({
    example: 'Juan Carlos',
    description: 'Nuevo nombre',
  })
  @IsString()
  @IsOptional()
  firstName?: string;

  @ApiPropertyOptional({
    example: 'Martínez Pérez',
    description: 'Nuevo apellido',
  })
  @IsString()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional({
    enum: ['ADMIN', 'EMPLEADO', 'CURSANTE'],
    description: 'Nuevo rol del usuario',
  })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}

export class UserResponseDto {
  @ApiProperty({
    example: 'cuid123',
    description: 'ID único del usuario',
  })
  id: string;

  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email del usuario',
  })
  email: string;

  @ApiProperty({
    example: 'Juan',
  })
  firstName: string;

  @ApiProperty({
    example: 'Pérez',
  })
  lastName: string;

  @ApiProperty({
    enum: ['ADMIN', 'EMPLEADO', 'CURSANTE'],
    example: 'CURSANTE',
  })
  role: UserRole;

  @ApiProperty({
    example: true,
    description: 'Si el usuario está activo',
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

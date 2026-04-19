import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignUpDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email único del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

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
}

export class SignInDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email de usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'password123',
    description: 'Contraseña del usuario',
  })
  @IsString()
  password: string;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Token JWT válido por 24 horas',
  })
  accessToken: string;

  @ApiProperty({
    description: 'Datos del usuario autenticado',
    example: {
      id: 'cuid123',
      email: 'usuario@example.com',
      firstName: 'Juan',
      lastName: 'Pérez',
      role: 'CURSANTE',
    },
  })
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
    role: string;
  };
}

export class GoogleLoginDto {
  @ApiProperty({
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjE...',
    description: 'Token de ID de Google',
  })
  @IsString()
  idToken: string;
}


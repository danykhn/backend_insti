import { Controller, Post, Get, Body, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignUpDto, SignInDto, AuthResponseDto } from './dto/auth.dto';
import type { Response } from 'express';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description: 'Crea un nuevo usuario con rol CURSANTE por defecto. Retorna token JWT.',
  })
  @ApiBody({
    type: SignUpDto,
    description: 'Datos de registro del nuevo usuario',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario ya existe o datos inválidos',
  })
  @ApiResponse({
    status: 422,
    description: 'Validación de datos fallida',
  })
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Iniciar sesión',
    description: 'Autentica usuario y retorna token JWT válido por 24h',
  })
  @ApiBody({
    type: SignInDto,
    description: 'Credenciales de usuario',
  })
  @ApiResponse({
    status: 200,
    description: 'Inicio de sesión exitoso',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Email o contraseña inválidos',
  })
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Iniciar sesión con Google',
    description: 'Redirige al usuario al formulario de login de Google',
  })
  async googleAuth(@Req() req: any) {
    // Este endpoint solo redirige a Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  @ApiOperation({
    summary: 'Callback de Google OAuth',
    description: 'Maneja la respuesta de Google y retorna el token JWT',
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación con Google exitosa',
    type: AuthResponseDto,
  })
  async googleCallback(@Req() req: any, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      
      // Redirigir al frontend con el token
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/callback?token=${result.accessToken}&user=${encodeURIComponent(JSON.stringify(result.user))}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/error?message=${error.message}`);
    }
  }

  @Post('google/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Completar login de Google',
    description: 'Endpoint para apps móviles o SPAs que reciben los datos del usuario de Google',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email del usuario de Google' },
        firstName: { type: 'string', description: 'Nombre del usuario' },
        lastName: { type: 'string', description: 'Apellido del usuario' },
        picture: { type: 'string', description: 'URL de la foto de perfil' },
        googleId: { type: 'string', description: 'ID de Google' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Autenticación con Google exitosa',
    type: AuthResponseDto,
  })
  async googleLoginMobile(@Body() body: any) {
    return this.authService.googleLogin(body);
  }
}

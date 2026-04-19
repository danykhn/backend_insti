import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validación automática con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Configurar CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      process.env.FRONTEND_URL || '',
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('Sistema de Cartillas Escolares API')
    .setDescription(
      'API REST para gestión de pedidos y cartillas escolares con autenticación JWT, WebSockets y múltiples roles',
    )
    .setVersion('1.0.0')
    .addTag('Auth', 'Endpoints de autenticación (signup/signin)')
    .addTag('Users', 'Gestión de usuarios y perfiles')
    .addTag('Cartillas', 'Catálogo de cartillas con filtros avanzados')
    .addTag('Etiquetas', 'Etiquetas y tags para cartillas')
    .addTag('Pedidos', 'Sistema completo de pedidos')
    .addTag('Pagos', 'Registros de pagos (transferencia/efectivo)')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.APP_PORT ?? 3000;
  await app.listen(port);
  console.log(`✅ Servidor iniciado en puerto ${port}`);
  console.log(`📚 Swagger disponible en http://localhost:${port}/api`);
}
bootstrap();

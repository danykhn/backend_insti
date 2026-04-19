import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Verifica que el servidor está funcionando',
  })
  @ApiResponse({
    status: 200,
    description: 'Servidor funcionando correctamente',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}


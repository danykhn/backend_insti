import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { PagosService } from './pagos.service';
import {
  RegistrarPagoTransferenciaDto,
  RegistrarPagoEfectivoDto,
  VerificarPagoDto,
} from './dto/pago.dto';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { Roles, CurrentUser } from '@decorators';

@ApiTags('Pagos')
@ApiBearerAuth('JWT-auth')
@Controller('pagos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PagosController {
  constructor(private pagosService: PagosService) {}

  @Post('transferencia')
  @Roles('CURSANTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar pago por transferencia',
    description:
      'Solo CURSANTE. Registra un pago por transferencia con comprobante',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago registrado (pendiente de verificación)',
  })
  @ApiResponse({
    status: 400,
    description: 'Pedido no encontrado o no pertenece al usuario',
  })
  registrarPagoTransferencia(
    @CurrentUser() user: any,
    @Body() registrarPagoDto: RegistrarPagoTransferenciaDto,
  ) {
    return this.pagosService.registrarPagoTransferencia(
      user.sub,
      registrarPagoDto,
    );
  }

  @Post('efectivo')
  @Roles('CURSANTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Registrar pago en efectivo',
    description:
      'Solo CURSANTE. Registra un pago en efectivo (automáticamente verificado)',
  })
  @ApiResponse({
    status: 201,
    description: 'Pago en efectivo registrado y verificado',
  })
  registrarPagoEfectivo(
    @CurrentUser() user: any,
    @Body() registrarPagoDto: RegistrarPagoEfectivoDto,
  ) {
    return this.pagosService.registrarPagoEfectivo(user.sub, registrarPagoDto);
  }

  @Patch(':id/verificar')
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Verificar pago',
    description:
      'Solo ADMIN/EMPLEADO. Verifica o rechaza un pago pendiente (solo transferencias)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pago a verificar',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago verificado/rechazado exitosamente',
  })
  verificarPago(@Body() verificarPagoDto: VerificarPagoDto) {
    return this.pagosService.verificarPago(verificarPagoDto);
  }

  @Get()
  @Roles('ADMIN', 'EMPLEADO', 'CURSANTE')
  @ApiOperation({
    summary: 'Listar pagos',
    description:
      'ADMIN/EMPLEADO ven todos. CURSANTE solo sus propios pagos',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['pendiente', 'verificado', 'rechazado'],
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    description: 'Filtrar por usuario (solo ADMIN/EMPLEADO)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pagos',
  })
  findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('estado') estado?: string,
    @CurrentUser() user?: any,
  ) {
    // Los cursantes solo pueden ver sus propios pagos
    if (user.role === 'CURSANTE') {
      return this.pagosService.findAll({ usuarioId: user.sub });
    }

    return this.pagosService.findAll({ usuarioId, estado });
  }

  @Get('stats')
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Estadísticas de pagos',
    description: 'Obtiene estadísticas de pagos y montos',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de pagos',
  })
  getStats() {
    return this.pagosService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLEADO', 'CURSANTE')
  @ApiOperation({
    summary: 'Obtener pago por ID',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Pago encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pago no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.pagosService.findOne(id);
  }
}

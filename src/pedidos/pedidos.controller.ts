import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
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
import { PedidosService } from './pedidos.service';
import { CreatePedidoDto, UpdatePedidoEstadoDto } from './dto/pedido.dto';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { Roles, CurrentUser } from '@decorators';

@ApiTags('Pedidos')
@ApiBearerAuth('JWT-auth')
@Controller('pedidos')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PedidosController {
  constructor(private pedidosService: PedidosService) {}

  @Post()
  @Roles('CURSANTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo pedido',
    description: 'Solo CURSANTE. Crea un pedido con cartillas y método de pago',
  })
  @ApiResponse({
    status: 201,
    description: 'Pedido creado exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Cartilla no disponible o sin inventory',
  })
  create(
    @CurrentUser() user: any,
    @Body() createPedidoDto: CreatePedidoDto,
  ) {
    return this.pedidosService.create(user.sub, createPedidoDto);
  }

  @Get()
  @Roles('ADMIN', 'EMPLEADO', 'CURSANTE')
  @ApiOperation({
    summary: 'Listar pedidos',
    description:
      'ADMIN/EMPLEADO ven todos. CURSANTE solo sus propios pedidos',
  })
  @ApiQuery({
    name: 'estado',
    required: false,
    enum: ['PENDIENTE', 'COMPLETADO', 'CANCELADO', 'PAGADO'],
  })
  @ApiQuery({
    name: 'usuarioId',
    required: false,
    description: 'Filtrar por ID de usuario (solo ADMIN/EMPLEADO)',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de pedidos',
  })
  findAll(
    @Query('usuarioId') usuarioId?: string,
    @Query('estado') estado?: string,
    @CurrentUser() user?: any,
  ) {
    // Los cursantes solo pueden ver sus propios pedidos
    if (user.role === 'CURSANTE') {
      return this.pedidosService.findAll({ usuarioId: user.sub });
    }

    return this.pedidosService.findAll({
      usuarioId,
      estado,
    });
  }

  @Get('stats')
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Estadísticas de pedidos',
    description: 'Obtiene estadísticas globales de pedidos y ganancias',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
  })
  getStats() {
    return this.pedidosService.getStats();
  }

  @Get(':id')
  @Roles('ADMIN', 'EMPLEADO', 'CURSANTE')
  @ApiOperation({
    summary: 'Obtener pedido por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del pedido',
  })
  @ApiResponse({
    status: 200,
    description: 'Pedido encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Pedido no encontrado',
  })
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.pedidosService.findOne(id);
  }

  @Patch(':id/estado')
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Cambiar estado de pedido',
    description: 'Actualiza el estado del pedido. Emite evento WebSocket',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description:
      'Estado actualizado (empleados conectados reciben actualización vía WebSocket)',
  })
  updateEstado(
    @Param('id') id: string,
    @Body() updatePedidoEstadoDto: UpdatePedidoEstadoDto,
  ) {
    return this.pedidosService.updateEstado(id, updatePedidoEstadoDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar pedido',
    description: 'Solo ADMIN. Elimina un pedido permanentemente',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 204,
    description: 'Pedido eliminado',
  })
  remove(@Param('id') id: string) {
    return this.pedidosService.remove(id);
  }
}

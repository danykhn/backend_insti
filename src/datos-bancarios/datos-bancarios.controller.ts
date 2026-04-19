import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { DatosBancariosService } from './datos-bancarios.service';
import { CreateDatosBancariosDto, UpdateDatosBancariosDto, DatosBancariosResponseDto } from './dto/datos-bancarios.dto';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { Roles } from '@decorators';

@ApiTags('DatosBancarios')
@ApiBearerAuth('JWT-auth')
@Controller('datos-bancarios')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DatosBancariosController {
  constructor(private datosBancariosService: DatosBancariosService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear datos bancarios',
    description: 'Solo para ADMIN. Crea nuevos datos bancarios',
  })
  @ApiResponse({
    status: 201,
    description: 'Datos bancarios creados exitosamente',
    type: DatosBancariosResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Ya existen datos bancarios con este CBU',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  create(@Body() createDatosBancariosDto: CreateDatosBancariosDto) {
    return this.datosBancariosService.create(createDatosBancariosDto);
  }

  @Get()
  @Roles('ADMIN', 'CURSANTE', 'EMPLEADO')
  @ApiOperation({
    summary: 'Listar todos los datos bancarios',
    description: 'ADMIN, CURSANTE y EMPLEADO pueden listar los datos bancarios',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de datos bancarios',
    type: [DatosBancariosResponseDto],
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  findAll() {
    return this.datosBancariosService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Obtener datos bancarios por ID',
    description: 'Solo ADMIN puede obtener datos bancarios por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de los datos bancarios',
    example: 'cuid123',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos bancarios encontrados',
    type: DatosBancariosResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Datos bancarios no encontrados',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  findOne(@Param('id') id: string) {
    return this.datosBancariosService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Actualizar datos bancarios',
    description: 'Solo ADMIN puede actualizar datos bancarios',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de los datos bancarios a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos bancarios actualizados',
    type: DatosBancariosResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Datos bancarios no encontrados',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  update(@Param('id') id: string, @Body() updateDatosBancariosDto: UpdateDatosBancariosDto) {
    return this.datosBancariosService.update(id, updateDatosBancariosDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar datos bancarios',
    description: 'Solo ADMIN. Elimina datos bancarios de forma permanente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de los datos bancarios a eliminar',
  })
  @ApiResponse({
    status: 204,
    description: 'Datos bancarios eliminados exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Datos bancarios no encontrados',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  remove(@Param('id') id: string) {
    return this.datosBancariosService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Desactivar datos bancarios',
    description: 'Marca datos bancarios como inactivos sin eliminarlos',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de los datos bancarios a desactivar',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos bancarios desactivados',
    type: DatosBancariosResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  deactivate(@Param('id') id: string) {
    return this.datosBancariosService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Activar datos bancaria',
    description: 'Marca datos bancarios inactivos como activos nuevamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de los datos bancarios a activar',
  })
  @ApiResponse({
    status: 200,
    description: 'Datos bancarios activados',
    type: DatosBancariosResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  activate(@Param('id') id: string) {
    return this.datosBancariosService.activate(id);
  }
}
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
import { CartillasService } from './cartillas.service';
import {
  CreateCartillaDto,
  UpdateCartillaDto,
  CreateEtiquetaDto,
  CartillaFilterDto,
} from './dto/cartilla.dto';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { Roles } from '@decorators';

@ApiTags('Cartillas')
@Controller('cartillas')
export class CartillasController {
  constructor(private cartillasService: CartillasService) {}

  // ===== CARTILLAS =====

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Crear nueva cartilla',
    description: 'Solo ADMIN. Crea una nueva cartilla en el catálogo',
  })
  @ApiResponse({
    status: 201,
    description: 'Cartilla creada exitosamente',
  })
  create(@Body() createCartillaDto: CreateCartillaDto) {
    return this.cartillasService.create(createCartillaDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar cartillas con filtros',
    description: 'Endpoint público. Lista todas las cartillas con filtros opcionales',
  })
  @ApiQuery({
    name: 'materia',
    required: false,
    description: 'Filtrar por materia (ej: Matemáticas)',
  })
  @ApiQuery({
    name: 'carrera',
    required: false,
    description: 'Filtrar por carrera (ej: Ingeniería)',
  })
  @ApiQuery({
    name: 'autor',
    required: false,
    description: 'Filtrar por autor',
  })
  @ApiQuery({
    name: 'etiqueta',
    required: false,
    description: 'Filtrar por ID de etiqueta',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de cartillas',
  })
  findAll(@Query() filters: CartillaFilterDto) {
    return this.cartillasService.findAll(filters);
  }

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Estadísticas de cartillas',
    description: 'Solo ADMIN. Obtiene estadísticas del catálogo de cartillas',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas',
  })
  getStats() {
    return this.cartillasService.getStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Obtener cartilla por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único de la cartilla',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartilla encontrada',
  })
  @ApiResponse({
    status: 404,
    description: 'Cartilla no encontrada',
  })
  findOne(@Param('id') id: string) {
    return this.cartillasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Actualizar cartilla',
    description: 'Solo ADMIN. Actualiza información de una cartilla',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la cartilla',
  })
  @ApiResponse({
    status: 200,
    description: 'Cartilla actualizada',
  })
  update(
    @Param('id') id: string,
    @Body() updateCartillaDto: UpdateCartillaDto,
  ) {
    return this.cartillasService.update(id, updateCartillaDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Eliminar cartilla',
    description: 'Solo ADMIN. Elimina una cartilla del catálogo',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 204,
    description: 'Cartilla eliminada',
  })
  remove(@Param('id') id: string) {
    return this.cartillasService.remove(id);
  }

  // ===== ETIQUETAS =====

  @Post('etiquetas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Etiquetas')
  @ApiOperation({
    summary: 'Crear nueva etiqueta',
    description: 'Solo ADMIN. Crea un nuevo tag para cartillas',
  })
  @ApiResponse({
    status: 201,
    description: 'Etiqueta creada',
  })
  createEtiqueta(@Body() createEtiquetaDto: CreateEtiquetaDto) {
    return this.cartillasService.createEtiqueta(createEtiquetaDto);
  }

  @Get('etiquetas')
  @ApiTags('Etiquetas')
  @ApiOperation({
    summary: 'Listar todas las etiquetas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de etiquetas',
  })
  findAllEtiquetas() {
    return this.cartillasService.findAllEtiquetas();
  }

  @Get('etiquetas/:id')
  @ApiTags('Etiquetas')
  @ApiOperation({
    summary: 'Obtener etiqueta por ID',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 200,
    description: 'Etiqueta encontrada',
  })
  findOneEtiqueta(@Param('id') id: string) {
    return this.cartillasService.findOneEtiqueta(id);
  }

  @Delete('etiquetas/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth('JWT-auth')
  @ApiTags('Etiquetas')
  @ApiOperation({
    summary: 'Eliminar etiqueta',
    description: 'Solo ADMIN',
  })
  @ApiParam({
    name: 'id',
  })
  @ApiResponse({
    status: 204,
    description: 'Etiqueta eliminada',
  })
  removeEtiqueta(@Param('id') id: string) {
    return this.cartillasService.removeEtiqueta(id);
  }
}

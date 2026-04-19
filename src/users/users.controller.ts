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
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto, UserResponseDto } from './dto/user.dto';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { Roles } from '@decorators';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post()
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear nuevo usuario',
    description: 'Solo para ADMIN. Crea un nuevo usuario con rol especificado',
  })
  @ApiResponse({
    status: 201,
    description: 'Usuario creado exitosamente',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El usuario ya existe',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene permisos (requiere ADMIN)',
  })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Listar todos los usuarios',
    description: 'ADMIN y EMPLEADO pueden ver todos los usuarios',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [UserResponseDto],
  })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Roles('ADMIN', 'CURSANTE')
  @ApiOperation({
    summary: 'Obtener usuario por ID',
    description: 'ADMIN puede ver cualquier usuario. CURSANTE solo su propio perfil',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del usuario',
    example: 'cuid123',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario encontrado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles('ADMIN', 'CURSANTE')
  @ApiOperation({
    summary: 'Actualizar usuario',
    description: 'ADMIN puede actualizar cualquier usuario. CURSANTE solo su propio perfil',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a actualizar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Eliminar usuario',
    description: 'Solo ADMIN. Elimina un usuario de forma permanente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a eliminar',
  })
  @ApiResponse({
    status: 204,
    description: 'Usuario eliminado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Usuario no encontrado',
  })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/deactivate')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Desactivar usuario',
    description: 'Marca un usuario como inactivo sin eliminarlo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a desactivar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario desactivado',
    type: UserResponseDto,
  })
  deactivate(@Param('id') id: string) {
    return this.usersService.deactivate(id);
  }

  @Patch(':id/activate')
  @Roles('ADMIN')
  @ApiOperation({
    summary: 'Activar usuario',
    description: 'Marca un usuario inactivo como activo nuevamente',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del usuario a activar',
  })
  @ApiResponse({
    status: 200,
    description: 'Usuario activado',
    type: UserResponseDto,
  })
  activate(@Param('id') id: string) {
    return this.usersService.activate(id);
  }
}

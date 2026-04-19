import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { email, firstName, lastName, role } = createUserDto;

    // Verificar si el usuario ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestException('El usuario ya existe');
    }

    // Generar una contraseña temporal
    const temporalPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(temporalPassword, 10);

    // Crear el usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        role: role || 'CURSANTE',
      },
    });

    // Retornar sin la contraseña
    return this.formatUserResponse(user);
  }

  async findAll() {
    const users = await this.prisma.user.findMany();
    return users.map(user => this.formatUserResponse(user));
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.formatUserResponse(user);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id); // Verificar que exista

    const user = await this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });

    return this.formatUserResponse(user);
  }

  async remove(id: string) {
    await this.findOne(id); // Verificar que exista

    return this.prisma.user.delete({
      where: { id },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: { isActive: true },
    });
  }

  private formatUserResponse(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}

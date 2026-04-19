import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreateDatosBancariosDto, UpdateDatosBancariosDto } from './dto/datos-bancarios.dto';

@Injectable()
export class DatosBancariosService {
  constructor(private prisma: PrismaService) {}

  async create(createDatosBancariosDto: CreateDatosBancariosDto) {
    const { alias, cbu, numeroCuenta, titular, nombreBanco } = createDatosBancariosDto;

    const existingCBU = await this.prisma.datosBancarios.findUnique({
      where: { cbu },
    });

    if (existingCBU) {
      throw new BadRequestException('Ya existen datos bancarios con este CBU');
    }

    const datosBancarios = await this.prisma.datosBancarios.create({
      data: {
        alias,
        cbu,
        numeroCuenta,
        titular,
        nombreBanco,
      },
    });

    return datosBancarios;
  }

  async findAll() {
    const datosBancarios = await this.prisma.datosBancarios.findMany({
      where: { isActive: true },
    });
    return datosBancarios;
  }

  async findOne(id: string) {
    const datosBancarios = await this.prisma.datosBancarios.findUnique({
      where: { id },
    });

    if (!datosBancarios) {
      throw new NotFoundException('Datos bancarios no encontrados');
    }

    return datosBancarios;
  }

  async update(id: string, updateDatosBancariosDto: UpdateDatosBancariosDto) {
    await this.findOne(id);

    if (updateDatosBancariosDto.cbu) {
      const existingCBU = await this.prisma.datosBancarios.findUnique({
        where: { cbu: updateDatosBancariosDto.cbu },
      });

      if (existingCBU && existingCBU.id !== id) {
        throw new BadRequestException('Ya existen datos bancarios con este CBU');
      }
    }

    const datosBancarios = await this.prisma.datosBancarios.update({
      where: { id },
      data: updateDatosBancariosDto,
    });

    return datosBancarios;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.datosBancarios.delete({
      where: { id },
    });
  }

  async deactivate(id: string) {
    await this.findOne(id);

    return this.prisma.datosBancarios.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async activate(id: string) {
    await this.findOne(id);

    return this.prisma.datosBancarios.update({
      where: { id },
      data: { isActive: true },
    });
  }
}
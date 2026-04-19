import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import {
  CreateCartillaDto,
  UpdateCartillaDto,
  CreateEtiquetaDto,
  CartillaFilterDto,
} from './dto/cartilla.dto';

@Injectable()
export class CartillasService {
  constructor(private prisma: PrismaService) { }

  // ===== CARTILLAS =====

  async create(createCartillaDto: CreateCartillaDto) {
    const { etiquetas = [], ...cartillaData } = createCartillaDto

    const etiquetaIds = await this.obtenerOcrearEtiquetas(etiquetas)

    const cartilla = await this.prisma.cartilla.create({
      data: {
        ...cartillaData,
        etiquetas: {
          connect: etiquetaIds.map(id => ({ id }))
        },
      },
      include: {
        etiquetas: true,
      },
    })

    return cartilla
  }

  async findAll(filters?: CartillaFilterDto) {
    const where: any = {};

    if (filters?.materia) {
      where.materia = { contains: filters.materia, mode: 'insensitive' };
    }

    if (filters?.carrera) {
      where.carrera = { contains: filters.carrera, mode: 'insensitive' };
    }

    if (filters?.autor) {
      where.autor = { contains: filters.autor, mode: 'insensitive' };
    }

    if (filters?.etiqueta) {
      where.etiquetas = {
        some: {
          id: filters.etiqueta,
        },
      };
    }

    const cartillas = await this.prisma.cartilla.findMany({
      where,
      include: {
        etiquetas: true,
      },
    });

    return cartillas;
  }

  async findOne(id: string) {
    const cartilla = await this.prisma.cartilla.findUnique({
      where: { id },
      include: {
        etiquetas: true,
      },
    });

    if (!cartilla) {
      throw new NotFoundException('Cartilla no encontrada');
    }

    return cartilla;
  }

  async update(id: string, updateCartillaDto: UpdateCartillaDto) {
    await this.findOne(id) // Verifica que exista

    const { etiquetas = [], ...cartillaData } = updateCartillaDto

    const etiquetaIds = await this.obtenerOcrearEtiquetas(etiquetas)

    const cartilla = await this.prisma.cartilla.update({
      where: { id },
      data: {
        ...cartillaData,
        etiquetas: {
          set: etiquetaIds.map(id => ({ id })),
        },
      },
      include: {
        etiquetas: true,
      },
    })

    return cartilla
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.cartilla.delete({
      where: { id },
    });
  }

  // ===== ETIQUETAS =====

  async createEtiqueta(createEtiquetaDto: CreateEtiquetaDto) {
    const existingEtiqueta = await this.prisma.etiqueta.findUnique({
      where: { nombre: createEtiquetaDto.nombre },
    });

    if (existingEtiqueta) {
      throw new BadRequestException('La etiqueta ya existe');
    }

    return this.prisma.etiqueta.create({
      data: createEtiquetaDto,
    });
  }

  async findAllEtiquetas() {
    return this.prisma.etiqueta.findMany({
      include: {
        cartillas: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findOneEtiqueta(id: string) {
    const etiqueta = await this.prisma.etiqueta.findUnique({
      where: { id },
      include: {
        cartillas: true,
      },
    });

    if (!etiqueta) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    return etiqueta;
  }

  async removeEtiqueta(id: string) {
    await this.findOneEtiqueta(id);

    return this.prisma.etiqueta.delete({
      where: { id },
    });
  }

  // ===== STATS =====

  async getStats() {
    const totalCartillas = await this.prisma.cartilla.count();
    const cartillasDisponibles = await this.prisma.cartilla.count({
      where: {
        cantidad: {
          gt: 0,
        },
      },
    });

    return {
      totalCartillas,
      cartillasDisponibles,
    };
  }

  private async obtenerOcrearEtiquetas(etiquetas: string[] = []) {
    const ids: string[] = []
    for (const nombreCrudo of etiquetas) {
      const nombre = nombreCrudo.trim()
      if (!nombre) continue
      let etiqueta = await this.prisma.etiqueta.findUnique({ where: { nombre } })
      if (!etiqueta) {
        etiqueta = await this.prisma.etiqueta.create({ data: { nombre } })
      }
      ids.push(etiqueta.id)
    }
    return ids
  }
}

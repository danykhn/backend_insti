import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import { CreatePedidoDto, UpdatePedidoEstadoDto } from './dto/pedido.dto';
import { CartillaStatus } from '@prisma/client';
import { PedidosGateway } from '@websockets/pedidos.gateway';

@Injectable()
export class PedidosService {
  constructor(
    private prisma: PrismaService,
    private pedidosGateway: PedidosGateway,
  ) {}

  async create(usuarioId: string, createPedidoDto: CreatePedidoDto) {
    const { articulos, metodo_pago, observaciones } = createPedidoDto;

    if (articulos.length === 0) {
      throw new BadRequestException('El pedido debe contener al menos un artículo');
    }

    // Calcular total
    let cantidadTotal = 0;
    let precioTotal = 0;
    const cartillasEnPedido: Array<{
      cartillaId: string;
      cantidad: number;
      precio_unitario: number;
      subtotal: number;
    }> = [];

    for (const articulo of articulos) {
      const cartilla = await this.prisma.cartilla.findUnique({
        where: { id: articulo.cartillaId },
      });

      if (!cartilla) {
        throw new NotFoundException(
          `Cartilla con ID ${articulo.cartillaId} no encontrada`,
        );
      }

      if (cartilla.cantidad < articulo.cantidad) {
        throw new BadRequestException(
          `No hay suficiente cantidad de la cartilla ${cartilla.titulo}`,
        );
      }

      const subtotal = cartilla.precio * articulo.cantidad;
      cantidadTotal += articulo.cantidad;
      precioTotal += subtotal;

      cartillasEnPedido.push({
        cartillaId: cartilla.id,
        cantidad: articulo.cantidad,
        precio_unitario: cartilla.precio,
        subtotal,
      });
    }

    // Crear el pedido
    const pedido = await this.prisma.pedido.create({
      data: {
        usuarioId,
        metodo_pago,
        estado: 'PENDIENTE',
        cantidad_total: cantidadTotal,
        precio_total: precioTotal,
        observaciones,
        cartillas: {
          createMany: {
            data: cartillasEnPedido,
          },
        },
      },
      include: {
        cartillas: {
          include: {
            cartilla: true,
          },
        },
      },
    });

    // Emitir evento de nuevo pedido
    this.pedidosGateway.emitirNuevoPedido(pedido);

    return pedido;
  }

  async findAll(filters?: {
    usuarioId?: string;
    estado?: string;
  }) {
    const where: any = {};

    if (filters?.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    const pedidos = await this.prisma.pedido.findMany({
      where,
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        cartillas: {
          include: {
            cartilla: true,
          },
        },
        payment: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return pedidos;
  }

  async findOne(id: string) {
    const pedido = await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        cartillas: {
          include: {
            cartilla: true,
          },
        },
        payment: true,
      },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    return pedido;
  }

  async updateEstado(id: string, updatePedidoEstadoDto: UpdatePedidoEstadoDto) {
    await this.findOne(id);

    const pedido = await this.prisma.pedido.update({
      where: { id },
      data: {
        estado: updatePedidoEstadoDto.estado,
        observaciones: updatePedidoEstadoDto.observaciones,
      },
      include: {
        usuario: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        cartillas: {
          include: {
            cartilla: true,
          },
        },
        payment: true,
      },
    });

    // Emitir evento de cambio de estado a todos los empleados
    this.pedidosGateway.notificarCambioEstadoAEmpleados(
      id,
      updatePedidoEstadoDto.estado,
      pedido,
    );

    return pedido;
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.pedido.delete({
      where: { id },
    });
  }

  // ===== STATS =====

  async getStats() {
    const totalPedidos = await this.prisma.pedido.count();
    const pedidosPendientes = await this.prisma.pedido.count({
      where: { estado: 'PENDIENTE' },
    });
    const pedidosCompletados = await this.prisma.pedido.count({
      where: { estado: 'COMPLETADO' },
    });
    const pedidosCancelados = await this.prisma.pedido.count({
      where: { estado: 'CANCELADO' },
    });
    const pedidosPagados = await this.prisma.pedido.count({
      where: { estado: 'PAGADO' },
    });

    const resultado = await this.prisma.pedido.aggregate({
      _sum: {
        precio_total: true,
      },
    });

    const totalGanancias = resultado._sum.precio_total || 0;

    return {
      totalPedidos,
      pedidosPendientes,
      pedidosCompletados,
      pedidosCancelados,
      pedidosPagados,
      totalGanancias,
    };
  }
}

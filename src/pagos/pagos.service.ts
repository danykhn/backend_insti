import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@database/prisma.service';
import {
  RegistrarPagoTransferenciaDto,
  RegistrarPagoEfectivoDto,
  VerificarPagoDto,
} from './dto/pago.dto';

@Injectable()
export class PagosService {
  constructor(private prisma: PrismaService) {}

  async registrarPagoTransferencia(
    usuarioId: string,
    registrarPagoDto: RegistrarPagoTransferenciaDto,
  ) {
    const { pedidoId, id_comprobante, fecha_transferencia, comprobante_url } =
      registrarPagoDto;

    // Verificar que el pedido existe
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.usuarioId !== usuarioId) {
      throw new BadRequestException(
        'No puedes registrar un pago para un pedido que no es tuyo',
      );
    }

    // Crear el registro de pago
    const payment = await this.prisma.payment.create({
      data: {
        pedidoId,
        usuarioId,
        metodo: 'TRANSFERENCIA',
        monto: pedido.precio_total,
        comprobante_url,
        id_comprobante,
        fecha_transferencia: new Date(fecha_transferencia),
        estado: 'pendiente',
      },
    });

    return payment;
  }

  async registrarPagoEfectivo(
    usuarioId: string,
    registrarPagoDto: RegistrarPagoEfectivoDto,
  ) {
    const { pedidoId, entregado_por } = registrarPagoDto;

    // Verificar que el pedido existe
    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido no encontrado');
    }

    if (pedido.usuarioId !== usuarioId) {
      throw new BadRequestException(
        'No puedes registrar un pago para un pedido que no es tuyo',
      );
    }

    // Crear el registro de pago
    const payment = await this.prisma.payment.create({
      data: {
        pedidoId,
        usuarioId,
        metodo: 'EFECTIVO',
        monto: pedido.precio_total,
        entregado_por,
        fecha_recepcion: new Date(),
        estado: 'verificado', // Se asume que el pago en efectivo ya fue verificado
      },
    });

    // Actualizar el estado del pedido a PAGADO
    await this.prisma.pedido.update({
      where: { id: pedidoId },
      data: { estado: 'PAGADO' },
    });

    return payment;
  }

  async verificarPago(verificarPagoDto: VerificarPagoDto) {
    const { paymentId, estado, observaciones } = verificarPagoDto;

    // Verificar que el pago existe
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    // Actualizar el estado del pago
    const updatedPayment = await this.prisma.payment.update({
      where: { id: paymentId },
      data: {
        estado,
        observaciones,
      },
    });

    // Si el pago fue verificado, actualizar el estado del pedido a PAGADO
    if (estado === 'verificado') {
      await this.prisma.pedido.update({
        where: { id: payment.pedidoId },
        data: { estado: 'PAGADO' },
      });
    } else if (estado === 'rechazado') {
      await this.prisma.pedido.update({
        where: { id: payment.pedidoId },
        data: { estado: 'PENDIENTE' },
      });
    }

    return updatedPayment;
  }

  async findAll(filters?: { usuarioId?: string; estado?: string }) {
    const where: any = {};

    if (filters?.usuarioId) {
      where.usuarioId = filters.usuarioId;
    }

    if (filters?.estado) {
      where.estado = filters.estado;
    }

    return this.prisma.payment.findMany({
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
        pedido: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
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
        pedido: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('Pago no encontrado');
    }

    return payment;
  }

  async getStats() {
    const totalPagos = await this.prisma.payment.count();
    const pagosVerificados = await this.prisma.payment.count({
      where: { estado: 'verificado' },
    });
    const pagosPendientes = await this.prisma.payment.count({
      where: { estado: 'pendiente' },
    });
    const pagosRechazados = await this.prisma.payment.count({
      where: { estado: 'rechazado' },
    });

    const resultado = await this.prisma.payment.aggregate({
      _sum: {
        monto: true,
      },
    });

    const totalMonto = resultado._sum.monto || 0;

    return {
      totalPagos,
      pagosVerificados,
      pagosPendientes,
      pagosRechazados,
      totalMonto,
    };
  }
}

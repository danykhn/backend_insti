import {
  Controller,
  Get,
  Post,
  Body,
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
  ApiHeader,
} from '@nestjs/swagger';
import { MercadoPagoService } from './mercadopago.service';
import { JwtAuthGuard, RolesGuard } from '@guards';
import { Roles, CurrentUser } from '@decorators';
import { PrismaService } from '@database/prisma.service';

@ApiTags('MercadoPago')
@Controller('mercadopago')
export class MercadoPagoController {
  constructor(
    private mercadoPagoService: MercadoPagoService,
    private prisma: PrismaService,
  ) {}

  @Post('crear-orden')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CURSANTE')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear orden de pago en Mercado Pago',
    description: 'Crea una orden de pago para un pedido específico',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiResponse({
    status: 201,
    description: 'Orden creada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Error al crear la orden',
  })
  async crearOrden(
    @CurrentUser() user: any,
    @Body()
    body: { pedidoId: string; paymentMethodId?: string; installments?: number },
  ) {
    const { pedidoId, paymentMethodId, installments } = body;

    const pedido = await this.prisma.pedido.findUnique({
      where: { id: pedidoId },
    });

    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    if (pedido.usuarioId !== user.sub) {
      throw new Error('No puedes pagar un pedido que no es tuyo');
    }

    const usuario = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });

    const items = await this.prisma.cartillaEnPedido.findMany({
      where: { pedidoId },
      include: { cartilla: true },
    });

    const description = items
      .map((item) => `${item.cartilla.titulo} (x${item.cantidad})`)
      .join(', ');

    const order = (await this.mercadoPagoService.createOrder({
      externalReference: pedidoId,
      amount: pedido.precio_total,
      description: description || `Pedido #${pedido.numeroOrden}`,
      payerEmail: usuario?.email || '',
    })) as any;

    // En sandbox usar sandbox_init_point; en producción usar init_point
    const paymentUrl = this.mercadoPagoService.isSandbox
      ? order.sandbox_init_point || order.init_point
      : order.init_point || order.sandbox_init_point;

    await this.prisma.payment.upsert({
      where: { pedidoId },
      update: {
        mercadoPagoOrderId: order.id,
        estado: 'pendiente',
      },
      create: {
        pedidoId,
        usuarioId: user.sub,
        metodo: 'TRANSFERENCIA',
        monto: pedido.precio_total,
        mercadoPagoOrderId: order.id,
        estado: 'pendiente',
      },
    });

    return {
      id: order.id,
      paymentUrl: paymentUrl,
      estado: 'pendiente',
    };
  }

  @Get('obtener-orden/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('CURSANTE', 'ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Obtener orden de pago',
    description: 'Obtiene el estado de una orden de pago',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'orderId',
    description: 'ID de la orden de Mercado Pago',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden encontrada',
  })
  async obtenerOrden(@Param('orderId') orderId: string) {
    const order = await this.mercadoPagoService.getOrder(orderId);
    return order;
  }

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de Mercado Pago',
    description: 'Endpoint para recibir notificaciones de Mercado Pago',
  })
  @ApiHeader({
    name: 'x-signature',
    required: false,
    description: 'Firma de verificación de Mercado Pago',
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado',
  })
  async webhook(@Body() body: any) {
    const topic = body.topic;
    const type = body.type;

    if (type === 'payment' || topic === 'payment') {
      const paymentData = body;

      if (paymentData.data?.id) {
        const mpPayment = (await this.mercadoPagoService.processWebhook({
          type: 'payment',
          data: { id: paymentData.data.id },
        })) as any;

        if (mpPayment) {
          const externalReference = mpPayment.external_reference;
          const status = mpPayment.status;

          let estado = 'pendiente';
          if (status === 'approved') {
            estado = 'verificado';
          } else if (status === 'rejected' || status === 'cancelled') {
            estado = 'rechazado';
          }

          await this.prisma.payment.updateMany({
            where: { pedidoId: externalReference },
            data: {
              mercadoPagoPaymentId: String(mpPayment.id),
              mercadoPagoStatus: mpPayment.status,
              estado,
            },
          });

          if (estado === 'verificado') {
            await this.prisma.pedido.update({
              where: { id: externalReference },
              data: { estado: 'PAGADO' },
            });
          } else if (estado === 'rechazado') {
            await this.prisma.pedido.update({
              where: { id: externalReference },
              data: { estado: 'PENDIENTE' },
            });
          }
        }
      }
    }

    return { status: 'ok' };
  }

  @Post('cancelar-orden/:orderId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Cancelar orden de pago',
    description: 'Cancela una orden de pago pendiente',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'orderId',
    description: 'ID de la orden de Mercado Pago',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden cancelada',
  })
  async cancelarOrden(@Param('orderId') orderId: string) {
    const order = await this.mercadoPagoService.cancelOrder(orderId);
    return order;
  }

  @Post('refund/:paymentId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'EMPLEADO')
  @ApiOperation({
    summary: 'Reembolsar pago',
    description: 'Reembolsa un pago (total o parcial)',
  })
  @ApiBearerAuth('JWT-auth')
  @ApiParam({
    name: 'paymentId',
    description: 'ID del pago de Mercado Pago',
  })
  @ApiResponse({
    status: 200,
    description: 'Reembolso realizado',
  })
  async refund(
    @Param('paymentId') paymentId: string,
    @Body() body: { amount?: number },
  ) {
    const refund = await this.mercadoPagoService.refundPayment(
      paymentId,
      body.amount,
    );
    return refund;
  }
}

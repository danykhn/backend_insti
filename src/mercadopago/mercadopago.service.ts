import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MercadoPagoService {
  private accessToken: string;
  private baseUrl: string;

  private isPublicHttpUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      const host = parsed.hostname.toLowerCase();
      const isHttp =
        parsed.protocol === 'http:' || parsed.protocol === 'https:';
      const isLocal =
        host === 'localhost' ||
        host === '127.0.0.1' ||
        host === '::1' ||
        host.endsWith('.local');

      return isHttp && !isLocal;
    } catch {
      return false;
    }
  }

  constructor(private configService: ConfigService) {
    this.accessToken =
      this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';

    // Tokens que empiezan con TEST- son de sandbox
    // Tokens APP_USR- también pueden ser de sandbox desde el dashboard
    const isSandbox =
      this.accessToken.startsWith('TEST-') ||
      this.accessToken.startsWith('APP_USR-');
    this.baseUrl = 'https://api.mercadopago.com';

    if (isSandbox) {
      console.log(
        '🔞 Modo SANDBOX de Mercado Pago activado (credenciales de prueba)',
      );
    }
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}?access_token=${this.accessToken}`;

    console.log(`🌐 Request a: ${url}`);
    console.log(`📦 Body: ${options.body}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    } as any);

    if (!response.ok) {
      const error = await response.text();
      console.error(`MercadoPago error: ${response.status} - ${error}`);
      throw new Error(`MercadoPago error: ${response.status} - ${error}`);
    }

    return response.json();
  }

  async createOrder(params: {
    externalReference: string;
    amount: number;
    description: string;
    payerEmail: string;
    paymentMethodId?: string;
    installments?: number;
  }) {
    const { externalReference, amount, description, payerEmail } = params;
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    const backendUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3000';

    const successUrl = `${frontendUrl}/checkout/success?pedido=${externalReference}`;
    const pendingUrl = `${frontendUrl}/checkout/pending?pedido=${externalReference}`;
    const failureUrl = `${frontendUrl}/checkout/failure?pedido=${externalReference}`;
    const webhookUrl = `${backendUrl}/mercadopago/webhook`;

    // Usar el endpoint correcto de preference (Checkout Pro)
    const preferenceData: Record<string, any> = {
      items: [
        {
          title: description,
          quantity: 1,
          unit_price: amount,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: payerEmail,
      },
      external_reference: externalReference,
      notification_url: webhookUrl,
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
    };

    // Mercado Pago suele rechazar auto_return=approved con URLs locales/no públicas.
    if (this.isPublicHttpUrl(successUrl)) {
      preferenceData.auto_return = 'approved';
    } else {
      console.warn(
        `Mercado Pago: se omite auto_return=approved porque success URL no es pública: ${successUrl}`,
      );
    }

    // El webhook requiere URL pública para recibir notificaciones desde Mercado Pago.
    if (!this.isPublicHttpUrl(webhookUrl)) {
      console.warn(
        `Mercado Pago: notification_url no es pública y no recibirá webhooks: ${webhookUrl}`,
      );
    }

    console.log('📝 Creando Preference de Mercado Pago:', preferenceData);

    return this.makeRequest('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify(preferenceData),
    });
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/checkout/preferences/${orderId}`, {
      method: 'GET',
    });
  }

  async captureOrder(orderId: string) {
    // Las preferences no se capturan, el pago es redirigido
    return { message: 'Usar redirect_url para procesar el pago' };
  }

  async cancelOrder(orderId: string) {
    return this.makeRequest(`/checkout/preferences/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ active: false }),
    });
  }

  async refundPayment(paymentId: string, amount?: number) {
    const body: Record<string, any> = {};
    if (amount) {
      body.amount = amount;
    }

    return this.makeRequest(`/payments/${paymentId}/refunds`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getPayment(paymentId: string) {
    return this.makeRequest(`/payments/${paymentId}`, { method: 'GET' });
  }

  async processWebhook(body: any) {
    const { type, data } = body;

    if (type === 'payment' || body.topic === 'payment') {
      const paymentId = data?.id || body.data?.id;
      if (paymentId) {
        return this.getPayment(paymentId);
      }
    }

    return null;
  }
}

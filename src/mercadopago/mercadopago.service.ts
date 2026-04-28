import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MercadoPagoService {
  private accessToken: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN') || '';
    
    // Tokens que empiezan con TEST- son de sandbox
    // Tokens APP_USR- también pueden ser de sandbox desde el dashboard
    const isSandbox = this.accessToken.startsWith('TEST-') || this.accessToken.startsWith('APP_USR-');
    this.baseUrl = 'https://api.mercadopago.com';
    
    if (isSandbox) {
      console.log('🔞 Modo SANDBOX de Mercado Pago activado (credenciales de prueba)');
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
      notification_url: `${this.configService.get('FRONTEND_URL')}/mercadopago/webhook`,
      auto_return: 'approved',
      back_urls: {
        success: `${this.configService.get('FRONTEND_URL')}/checkout/success?pedido=${externalReference}`,
        pending: `${this.configService.get('FRONTEND_URL')}/checkout/pending?pedido=${externalReference}`,
        failure: `${this.configService.get('FRONTEND_URL')}/checkout/failure?pedido=${externalReference}`,
      },
    };

    console.log('📝 Creando Preference de Mercado Pago:', preferenceData);

    return this.makeRequest('/checkout/preferences', {
      method: 'POST',
      body: JSON.stringify(preferenceData),
    });
  }

  async getOrder(orderId: string) {
    return this.makeRequest(`/checkout/preferences/${orderId}`, { method: 'GET' });
  }

  async captureOrder(orderId: string) {
    // Las preferences no se capturan, el pago es redirigido
    return { message: 'Usar redirect_url para procesar el pago' };
  }

  async cancelOrder(orderId: string) {
    return this.makeRequest(`/checkout/preferences/${orderId}`, { method: 'PUT', body: JSON.stringify({ active: false }) });
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
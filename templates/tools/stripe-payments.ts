/**
 * Stripe Payments Tool
 * Accept payments and manage customers via Stripe API
 */

import Stripe from 'stripe';

export interface PaymentIntentOptions {
  amount: number; // Amount in cents
  currency?: string;
  customer?: string;
  payment_method?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface CustomerOptions {
  email: string;
  name?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export class StripePayments {
  private stripe: Stripe;

  constructor() {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set. Get from: https://dashboard.stripe.com/apikeys');
    }

    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-06-20.acacia',
    });
  }

  /**
   * Create a payment intent
   */
  async createPaymentIntent(options: PaymentIntentOptions): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: options.amount,
        currency: options.currency || 'usd',
        customer: options.customer,
        payment_method: options.payment_method,
        description: options.description,
        metadata: options.metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return paymentIntent;
    } catch (error: any) {
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Confirm a payment intent
   */
  async confirmPayment(paymentIntentId: string, paymentMethodId?: string): Promise<Stripe.PaymentIntent> {
    try {
      const paymentIntent = await this.stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      return paymentIntent;
    } catch (error: any) {
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  /**
   * Refund a payment
   */
  async refundPayment(chargeId: string, amount?: number): Promise<Stripe.Refund> {
    try {
      const refund = await this.stripe.refunds.create({
        charge: chargeId,
        amount: amount, // If not provided, full refund
      });

      return refund;
    } catch (error: any) {
      throw new Error(`Failed to refund payment: ${error.message}`);
    }
  }

  /**
   * Create a customer
   */
  async createCustomer(options: CustomerOptions): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.create({
        email: options.email,
        name: options.name,
        description: options.description,
        metadata: options.metadata,
      });

      return customer;
    } catch (error: any) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomer(customerId: string): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.retrieve(customerId);
      
      if (customer.deleted) {
        throw new Error('Customer has been deleted');
      }

      return customer as Stripe.Customer;
    } catch (error: any) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  /**
   * Update a customer
   */
  async updateCustomer(
    customerId: string,
    updates: Partial<CustomerOptions>
  ): Promise<Stripe.Customer> {
    try {
      const customer = await this.stripe.customers.update(customerId, {
        email: updates.email,
        name: updates.name,
        description: updates.description,
        metadata: updates.metadata,
      });

      return customer;
    } catch (error: any) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  /**
   * List charges for a customer
   */
  async listCharges(customerId?: string, limit: number = 10): Promise<Stripe.Charge[]> {
    try {
      const charges = await this.stripe.charges.list({
        customer: customerId,
        limit,
      });

      return charges.data;
    } catch (error: any) {
      throw new Error(`Failed to list charges: ${error.message}`);
    }
  }

  /**
   * Get a charge by ID
   */
  async getCharge(chargeId: string): Promise<Stripe.Charge> {
    try {
      const charge = await this.stripe.charges.retrieve(chargeId);
      return charge;
    } catch (error: any) {
      throw new Error(`Failed to get charge: ${error.message}`);
    }
  }

  /**
   * Create a checkout session
   */
  async createCheckoutSession(
    priceId: string,
    successUrl: string,
    cancelUrl: string,
    customerId?: string
  ): Promise<Stripe.Checkout.Session> {
    try {
      const session = await this.stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      });

      return session;
    } catch (error: any) {
      throw new Error(`Failed to create checkout session: ${error.message}`);
    }
  }
}

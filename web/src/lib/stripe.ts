/**
 * Stripe REST client + webhook verification, implemented with raw fetch.
 *
 * No npm dependency on the `stripe` package — we don't want to add deps that
 * require running npm install locally (Sameer's Windows dev env doesn't have
 * Node installed). Stripe's REST API is form-urlencoded and well-documented;
 * everything we need fits in ~150 lines.
 *
 * Stripe is JUST a payment gateway — products, prices, and business rules
 * live in Strapi (see lib/strapi-purchasable.ts).
 *
 * Env vars:
 *   STRIPE_SECRET_KEY      - sk_test_... or sk_live_...
 *   STRIPE_WEBHOOK_SECRET  - whsec_... (from Stripe Dashboard -> Webhooks)
 */

import crypto from 'node:crypto';

const STRIPE_API = 'https://api.stripe.com/v1';

function getSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY not set');
  return key;
}

/**
 * Stripe expects form-urlencoded with bracketed keys for nested objects:
 *   { line_items: [{ price_data: { currency: 'gbp' } }] }
 *   becomes line_items[0][price_data][currency]=gbp
 *
 * This walks any JS value and emits the right key path.
 */
function encodeStripeForm(prefix: string, value: any, params: URLSearchParams): void {
  if (value === null || value === undefined) return;
  if (Array.isArray(value)) {
    value.forEach((item, idx) => encodeStripeForm(`${prefix}[${idx}]`, item, params));
    return;
  }
  if (typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      encodeStripeForm(`${prefix}[${k}]`, v, params);
    }
    return;
  }
  // Primitives: string, number, boolean
  params.append(prefix, String(value));
}

function toFormBody(payload: Record<string, any>): string {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(payload)) {
    encodeStripeForm(k, v, params);
  }
  return params.toString();
}

async function stripeRequest<T = any>(
  method: 'GET' | 'POST',
  path: string,
  payload?: Record<string, any>,
): Promise<T> {
  const url = `${STRIPE_API}${path}`;
  const headers: Record<string, string> = {
    Authorization: 'Bearer ' + getSecretKey(),
  };
  let body: string | undefined;
  if (method === 'POST' && payload) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = toFormBody(payload);
  }
  const res = await fetch(url, { method, headers, body, cache: 'no-store' });
  const text = await res.text();
  let json: any;
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (!res.ok) {
    const msg = json?.error?.message || text || `HTTP ${res.status}`;
    throw new Error(`Stripe ${method} ${path} -> ${res.status}: ${msg}`);
  }
  return json as T;
}

// ─── Public API: shape mirrors the official SDK's surface we use ───

export type StripeCheckoutSession = {
  id: string;
  url: string | null;
  customer: string | null;
  customer_email: string | null;
  customer_details?: { email: string | null };
  metadata: Record<string, string>;
  line_items?: { data: Array<{ price: { id: string } | null }> };
  amount_total?: number | null;
  amount_subtotal?: number | null;
  currency?: string | null;
};

export type StripeSubscription = {
  id: string;
  customer: string;
  status: string;
  metadata: Record<string, string>;
  items: { data: Array<{ price: { id: string } }> };
};

export type StripeCustomer = {
  id: string;
  email: string | null;
  deleted?: boolean;
};

export type StripeEvent = {
  id: string;
  type: string;
  data: { object: any };
  created: number;
};

export type StripeCoupon = {
  id: string;
  amount_off: number | null;
  percent_off: number | null;
  currency: string | null;
  duration: 'once' | 'forever' | 'repeating';
  name: string | null;
};

export type StripeRefund = {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'canceled' | 'requires_action';
  payment_intent: string | null;
  charge: string | null;
  reason: string | null;
  failure_reason: string | null;
};

export type StripePaymentIntent = {
  id: string;
  amount: number;
  amount_received: number;
  currency: string;
  status: string;
  latest_charge: string | null;
};

export const stripe = {
  checkout: {
    sessions: {
      create: (payload: Record<string, any>) =>
        stripeRequest<StripeCheckoutSession>('POST', '/checkout/sessions', payload),
      retrieve: async (id: string, opts?: { expand?: string[] }) => {
        let path = `/checkout/sessions/${encodeURIComponent(id)}`;
        if (opts?.expand?.length) {
          const params = new URLSearchParams();
          opts.expand.forEach((e, i) => params.append(`expand[${i}]`, e));
          path += `?${params.toString()}`;
        }
        return stripeRequest<StripeCheckoutSession>('GET', path);
      },
    },
  },
  subscriptions: {
    retrieve: (id: string) =>
      stripeRequest<StripeSubscription>('GET', `/subscriptions/${encodeURIComponent(id)}`),
  },
  customers: {
    retrieve: (id: string) =>
      stripeRequest<StripeCustomer>('GET', `/customers/${encodeURIComponent(id)}`),
  },
  coupons: {
    create: (payload: Record<string, any>) =>
      stripeRequest<StripeCoupon>('POST', '/coupons', payload),
  },
  refunds: {
    /**
     * Create a refund. Pass payment_intent OR charge. amount in pence/cents
     * (omit for full refund). reason: 'duplicate' | 'fraudulent' | 'requested_by_customer'.
     */
    create: (payload: Record<string, any>) =>
      stripeRequest<StripeRefund>('POST', '/refunds', payload),
    retrieve: (id: string) =>
      stripeRequest<StripeRefund>('GET', `/refunds/${encodeURIComponent(id)}`),
  },
  paymentIntents: {
    retrieve: (id: string) =>
      stripeRequest<StripePaymentIntent>('GET', `/payment_intents/${encodeURIComponent(id)}`),
  },
  webhooks: {
    /**
     * Verify the Stripe-Signature header and return the parsed event.
     * Throws if signature does not match.
     *
     * Tolerance: rejects timestamps older than 5 minutes (replay protection).
     */
    constructEvent: (rawBody: string, signature: string, secret: string): StripeEvent => {
      // Header format: "t=<unix_seconds>,v1=<hex_sig>,v1=<hex_sig>,..."
      const parts = signature.split(',').reduce<Record<string, string[]>>((acc, p) => {
        const [k, v] = p.split('=');
        if (!k || !v) return acc;
        if (!acc[k]) acc[k] = [];
        acc[k].push(v);
        return acc;
      }, {});

      const timestamp = parts.t?.[0];
      const v1Sigs = parts.v1 || [];
      if (!timestamp || v1Sigs.length === 0) {
        throw new Error('Invalid Stripe-Signature header');
      }

      const ts = parseInt(timestamp, 10);
      if (!Number.isFinite(ts)) throw new Error('Invalid timestamp in signature');
      const ageSec = Math.floor(Date.now() / 1000) - ts;
      if (ageSec > 300) throw new Error(`Signature too old (${ageSec}s)`);

      const signedPayload = `${timestamp}.${rawBody}`;
      const expected = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

      const expectedBuf = Buffer.from(expected, 'hex');
      const matched = v1Sigs.some((sig) => {
        try {
          const sigBuf = Buffer.from(sig, 'hex');
          return sigBuf.length === expectedBuf.length && crypto.timingSafeEqual(sigBuf, expectedBuf);
        } catch {
          return false;
        }
      });

      if (!matched) throw new Error('Signature mismatch');

      return JSON.parse(rawBody) as StripeEvent;
    },
  },
};

/**
 * Transactional email — hand-rolled REST client for Resend.
 * No SDK (project rule: no npm packages we can't lock locally).
 *
 * Env vars (all optional — silently no-ops if missing, so dev/preview never
 * blocks on a missing API key):
 *   RESEND_API_KEY     — sign up free at resend.com (100/day free tier)
 *   EMAIL_FROM         — e.g. "Anna Lou Wellness <hello@annalouwellness.com>"
 *                        Must be a verified Resend sender domain or the default
 *                        onboarding@resend.dev (dev only).
 *   OWNER_EMAIL        — where the "new order" notification goes. Defaults to
 *                        hello@annalouwellness.com.
 */

import type { EmailTemplate } from './strapi-admin';
import { fetchEmailTemplate } from './strapi-admin';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Anna Lou Wellness <onboarding@resend.dev>';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'hello@annalouwellness.com';
const PUBLIC_SITE_URL = process.env.PUBLIC_SITE_URL || 'https://staging.annalouwellness.com';
const ADMIN_URL = process.env.ADMIN_URL || 'https://cms.annalouwellness.com/admin';

type SendArgs = { to: string; subject: string; html: string; text?: string; replyTo?: string };

async function send({ to, subject, html, text, replyTo }: SendArgs): Promise<{ ok: boolean; error?: string }> {
  if (!RESEND_API_KEY) {
    console.info(`[email] skipped (no RESEND_API_KEY) — would have sent "${subject}" to ${to}`);
    return { ok: false, error: 'RESEND_API_KEY not set' };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to,
        subject,
        html,
        text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.warn(`[email] Resend ${res.status} sending "${subject}" to ${to}: ${body}`);
      return { ok: false, error: `${res.status}: ${body}` };
    }
    return { ok: true };
  } catch (err: any) {
    console.warn(`[email] send failed for "${subject}" to ${to}:`, err?.message);
    return { ok: false, error: err?.message };
  }
}

// ─── Order confirmation (to customer) ───

export type OrderEmailItem = { id: number; name: string; price: number; qty: number };
export type OrderEmailInput = {
  order_number: string;
  payment_method: 'stripe' | 'bank_transfer';
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  items: OrderEmailItem[];
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  gift_wrap_amount: number;
  total: number;
};

function money(n: number): string {
  return `£${(Math.round(n * 100) / 100).toFixed(2)}`;
}

function escape(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

function itemsTable(items: OrderEmailItem[]): string {
  const rows = items.map((i) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #ece6dc;font-family:'Lora',Georgia,serif;color:#3D3D3A;">${escape(i.name)}</td>
      <td style="padding:8px 0;border-bottom:1px solid #ece6dc;font-family:'Lora',Georgia,serif;color:#6e6a62;text-align:center;">${i.qty}</td>
      <td style="padding:8px 0;border-bottom:1px solid #ece6dc;font-family:'Lora',Georgia,serif;color:#3D3D3A;text-align:right;">${money(i.price * i.qty)}</td>
    </tr>`).join('');
  return `<table style="width:100%;border-collapse:collapse;margin:12px 0;">
    <thead><tr>
      <th style="text-align:left;padding:6px 0;border-bottom:1px solid #c8c4bc;font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6e6a62;">Item</th>
      <th style="text-align:center;padding:6px 0;border-bottom:1px solid #c8c4bc;font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6e6a62;">Qty</th>
      <th style="text-align:right;padding:6px 0;border-bottom:1px solid #c8c4bc;font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#6e6a62;">Total</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function totalsBlock(i: OrderEmailInput): string {
  const row = (label: string, value: string, bold = false) => `
    <tr>
      <td style="padding:4px 0;font-family:'Lora',Georgia,serif;color:#6e6a62;${bold ? 'font-weight:600;color:#1a1a18;font-size:15px;padding-top:10px;border-top:1px solid #c8c4bc;' : ''}">${label}</td>
      <td style="padding:4px 0;font-family:'Lora',Georgia,serif;color:#1a1a18;text-align:right;${bold ? 'font-weight:600;font-size:15px;padding-top:10px;border-top:1px solid #c8c4bc;' : ''}">${value}</td>
    </tr>`;
  return `<table style="width:100%;border-collapse:collapse;margin:8px 0;">
    ${row('Subtotal', money(i.subtotal))}
    ${i.discount_amount > 0 ? row('Discount', `&minus;${money(i.discount_amount)}`) : ''}
    ${row('Shipping', i.shipping_cost > 0 ? money(i.shipping_cost) : 'Free')}
    ${i.gift_wrap_amount > 0 ? row('Gift wrap', money(i.gift_wrap_amount)) : ''}
    ${row('Total', money(i.total), true)}
  </table>`;
}

export async function sendOrderConfirmation(input: OrderEmailInput): Promise<{ ok: boolean; error?: string }> {
  const heading = input.payment_method === 'bank_transfer'
    ? 'Your order — pending bank transfer'
    : 'Your order is confirmed';

  const intro = input.payment_method === 'bank_transfer'
    ? `Thank you, ${escape(input.customer_name)}. We've received your order and it's waiting on your bank transfer. Your order will be confirmed and dispatched once payment lands in our account.`
    : `Thank you, ${escape(input.customer_name)}. Your payment has been received and your order is confirmed. We'll email you again when it ships.`;

  const bankBlock = input.payment_method === 'bank_transfer' ? `
    <div style="background:#f5f0e8;padding:18px 20px;margin:20px 0;border:1px solid #ece6dc;">
      <p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6E3A5A;margin:0 0 10px;">Bank transfer details</p>
      <p style="font-family:'Lora',Georgia,serif;font-size:14px;color:#3D3D3A;margin:0 0 10px;line-height:1.6;">
        Please transfer <strong>${money(input.total)}</strong> using your order number <strong>${escape(input.order_number)}</strong> as the reference.
      </p>
      <table style="font-family:'Lora',Georgia,serif;font-size:14px;color:#3D3D3A;line-height:1.8;border-collapse:collapse;">
        <tr><td><strong>Account name:</strong></td><td style="padding-left:12px;">Anna Lou Wellness</td></tr>
        <tr><td><strong>Sort code:</strong></td><td style="padding-left:12px;">XX-XX-XX</td></tr>
        <tr><td><strong>Account number:</strong></td><td style="padding-left:12px;">XXXXXXXX</td></tr>
        <tr><td><strong>IBAN:</strong></td><td style="padding-left:12px;">GB00 XXXX XXXX XXXX XXXX XX</td></tr>
        <tr><td><strong>Reference:</strong></td><td style="padding-left:12px;">${escape(input.order_number)}</td></tr>
      </table>
    </div>` : '';

  const html = `<!doctype html>
<html><body style="margin:0;padding:0;background:#fafaf7;">
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#fafaf7;padding:30px 20px;">
    <tr><td align="center">
      <table role="presentation" style="width:100%;max-width:600px;background:#fff;border-collapse:collapse;">
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #ece6dc;">
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:24px;color:#1a1a18;margin:0;letter-spacing:0.02em;">Anna Lou Wellness</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4704a;margin:0 0 6px;">${heading}</p>
          <p style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:22px;color:#1a1a18;margin:0 0 18px;">Order ${escape(input.order_number)}</p>
          <p style="font-family:'Lora',Georgia,serif;font-size:15px;color:#3D3D3A;line-height:1.7;margin:0 0 18px;">${intro}</p>
          ${bankBlock}
          ${itemsTable(input.items)}
          ${totalsBlock(input)}
          <p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6e6a62;margin:24px 0 6px;">Shipping to</p>
          <p style="font-family:'Lora',Georgia,serif;font-size:14px;color:#3D3D3A;line-height:1.6;white-space:pre-line;margin:0;">${escape(input.shipping_address)}</p>
        </td></tr>
        <tr><td style="padding:24px 32px;background:#f5f0e8;font-family:'Lora',Georgia,serif;font-size:13px;color:#6e6a62;line-height:1.6;">
          Questions? Reply to this email — we read every message.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  const text = [
    `${heading}`,
    `Order ${input.order_number}`,
    '',
    intro.replace(/<[^>]+>/g, ''),
    '',
    ...(input.payment_method === 'bank_transfer' ? [
      `Bank transfer details:`,
      `  Amount: ${money(input.total)}`,
      `  Reference: ${input.order_number}`,
      `  Account name: Anna Lou Wellness`,
      `  Sort code: XX-XX-XX`,
      `  Account number: XXXXXXXX`,
      `  IBAN: GB00 XXXX XXXX XXXX XXXX XX`,
      '',
    ] : []),
    'Items:',
    ...input.items.map((i) => `  ${i.name} x${i.qty}  ${money(i.price * i.qty)}`),
    '',
    `Subtotal: ${money(input.subtotal)}`,
    ...(input.discount_amount > 0 ? [`Discount: -${money(input.discount_amount)}`] : []),
    `Shipping: ${input.shipping_cost > 0 ? money(input.shipping_cost) : 'Free'}`,
    ...(input.gift_wrap_amount > 0 ? [`Gift wrap: ${money(input.gift_wrap_amount)}`] : []),
    `Total: ${money(input.total)}`,
    '',
    `Shipping to:`,
    input.shipping_address,
  ].join('\n');

  return send({
    to: input.customer_email,
    subject: input.payment_method === 'bank_transfer'
      ? `Order received — ${input.order_number} (awaiting bank transfer)`
      : `Order confirmed — ${input.order_number}`,
    html,
    text,
    replyTo: OWNER_EMAIL,
  });
}

// ─── New-order notification (to Anna) ───

export type OwnerNotifyInput = {
  order_number: string;
  payment_method: 'stripe' | 'bank_transfer';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  shipping_address: string;
  items: OrderEmailItem[];
  total: number;
};

export async function sendOwnerOrderNotification(input: OwnerNotifyInput): Promise<{ ok: boolean; error?: string }> {
  const paidStatus = input.payment_method === 'stripe' ? 'PAID via Stripe' : 'AWAITING bank transfer';
  const html = `<!doctype html>
<html><body style="margin:0;padding:24px;background:#fafaf7;font-family:'Lora',Georgia,serif;color:#3D3D3A;">
  <div style="max-width:600px;margin:0 auto;background:#fff;padding:24px;border:1px solid #ece6dc;">
    <p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4704a;margin:0 0 6px;">New order — ${paidStatus}</p>
    <h2 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:22px;margin:0 0 14px;color:#1a1a18;">Order ${escape(input.order_number)} &middot; ${money(input.total)}</h2>
    <p style="margin:0 0 4px;"><strong>Customer:</strong> ${escape(input.customer_name)} &lt;${escape(input.customer_email)}&gt;</p>
    ${input.customer_phone ? `<p style="margin:0 0 4px;"><strong>Phone:</strong> ${escape(input.customer_phone)}</p>` : ''}
    <p style="margin:0 0 4px;"><strong>Address:</strong></p>
    <p style="margin:0 0 14px;white-space:pre-line;color:#6e6a62;">${escape(input.shipping_address)}</p>
    <p style="margin:14px 0 4px;"><strong>Items:</strong></p>
    <ul style="margin:0 0 14px;padding-left:18px;">${input.items.map((i) => `<li>${escape(i.name)} &times; ${i.qty} &mdash; ${money(i.price * i.qty)}</li>`).join('')}</ul>
    <p style="font-size:12px;color:#6e6a62;margin:18px 0 0;">View in Strapi admin: <a href="https://cms.annalouwellness.com/admin">cms.annalouwellness.com/admin</a></p>
  </div>
</body></html>`;

  const text = [
    `New order — ${paidStatus}`,
    `Order ${input.order_number} · ${money(input.total)}`,
    ``,
    `Customer: ${input.customer_name} <${input.customer_email}>`,
    ...(input.customer_phone ? [`Phone: ${input.customer_phone}`] : []),
    `Address:`,
    input.shipping_address,
    ``,
    `Items:`,
    ...input.items.map((i) => `  ${i.name} x${i.qty}  ${money(i.price * i.qty)}`),
  ].join('\n');

  return send({
    to: OWNER_EMAIL,
    subject: `[New order] ${input.order_number} · ${money(input.total)} · ${input.payment_method === 'stripe' ? 'PAID' : 'BANK PENDING'}`,
    html,
    text,
    replyTo: input.customer_email,
  });
}

// ─── Generic template-driven email (lifecycle stages) ───
// Pulls subject + body copy from Strapi's Email Template collection (Anna
// edits these). Falls back gracefully if a template is missing or disabled.

type OrderLike = {
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string | null;
  shipping_address: string;
  items?: any;
  subtotal?: number;
  shipping_cost?: number;
  discount_amount?: number;
  total: number;
  tracking_number?: string | null;
  tracking_url?: string | null;
  shipping_carrier?: string | null;
  cancellation_reason?: string | null;
  refund_amount?: number | null;
  payment_method?: string;
};

type ReturnRequestLike = {
  reason?: string;
  notes?: string;
};

type AccountLike = {
  first_name?: string | null;
  email: string;
  set_password_url?: string | null;
  reset_password_url?: string | null;
};

type LeadLike = {
  type?: string;
  tag?: string;
  email?: string;
  first_name?: string;
  phone?: string;
  practice?: string;
  message?: string;
  submitted_at?: string;
};

type MergeContext = {
  order?: OrderLike | null;
  returnRequest?: ReturnRequestLike | null;
  account?: AccountLike | null;
  lead?: LeadLike | null;
};

function mergeTags(input: string | undefined | null, ctx: MergeContext): string {
  if (!input) return '';
  const { order, returnRequest, account, lead } = ctx;
  const customerName = order?.customer_name || account?.first_name || lead?.first_name || 'there';
  const customerEmail = order?.customer_email || account?.email || lead?.email || '';
  const replacements: Record<string, string> = {
    // Order context — empty strings when there's no order (account-only emails)
    order_number: order?.order_number || '',
    customer_name: customerName,
    customer_email: customerEmail,
    total: order ? (Number(order.total) || 0).toFixed(2) : '',
    shipping_address: order?.shipping_address || '',
    tracking_number: order?.tracking_number || '',
    tracking_url: order?.tracking_url || '',
    shipping_carrier: order?.shipping_carrier || 'our courier',
    cancellation_reason: order?.cancellation_reason || '',
    refund_amount: order?.refund_amount != null
      ? Number(order.refund_amount).toFixed(2)
      : order
        ? (Number(order.total) || 0).toFixed(2)
        : '',
    return_reason: returnRequest?.reason ? returnRequest.reason.replace(/_/g, ' ') : '',
    return_notes: returnRequest?.notes || '',
    // Account context
    first_name: account?.first_name || lead?.first_name || customerName,
    set_password_url: account?.set_password_url || '',
    reset_password_url: account?.reset_password_url || account?.set_password_url || '',
    // Lead context (admin enquiry notifications)
    lead_type: lead?.type || '',
    lead_tag: lead?.tag || '',
    lead_email: lead?.email || '',
    lead_first_name: lead?.first_name || '',
    lead_phone: lead?.phone || '',
    lead_practice: lead?.practice || '',
    lead_message: lead?.message || '',
    lead_submitted_at: lead?.submitted_at || '',
    // Constants
    site_url: PUBLIC_SITE_URL,
    admin_url: ADMIN_URL,
  };
  return input.replace(/\{\{\s*(\w+)\s*\}\}/g, (_match, key) => replacements[key] ?? '');
}

function richtextToHtml(input: string | undefined | null, ctx: MergeContext): string {
  const merged = mergeTags(input, ctx);
  if (!merged.trim()) return '';
  // Strapi richtext is markdown-lite. Treat each blank-line-separated chunk
  // as a paragraph; convert single newlines inside a chunk to <br>.
  const paragraphs = merged.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  return paragraphs.map((p) => `<p style="font-family:'Lora',Georgia,serif;font-size:15px;color:#3D3D3A;line-height:1.7;margin:0 0 14px;">${escape(p).replace(/\n/g, '<br>')}</p>`).join('');
}

function richtextToText(input: string | undefined | null, ctx: MergeContext): string {
  return mergeTags(input, ctx);
}

function bankDetailsHtml(order: OrderLike): string {
  return `<div style="background:#f5f0e8;padding:18px 20px;margin:0 0 20px;border:1px solid #ece6dc;">
    <p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6E3A5A;margin:0 0 10px;">Bank transfer details</p>
    <p style="font-family:'Lora',Georgia,serif;font-size:14px;color:#3D3D3A;margin:0 0 10px;line-height:1.6;">
      Please transfer <strong>${money(order.total)}</strong> using your order number <strong>${escape(order.order_number)}</strong> as the reference.
    </p>
    <table style="font-family:'Lora',Georgia,serif;font-size:14px;color:#3D3D3A;line-height:1.8;border-collapse:collapse;">
      <tr><td><strong>Account name:</strong></td><td style="padding-left:12px;">Anna Lou Wellness</td></tr>
      <tr><td><strong>Sort code:</strong></td><td style="padding-left:12px;">XX-XX-XX</td></tr>
      <tr><td><strong>Account number:</strong></td><td style="padding-left:12px;">XXXXXXXX</td></tr>
      <tr><td><strong>IBAN:</strong></td><td style="padding-left:12px;">GB00 XXXX XXXX XXXX XXXX XX</td></tr>
      <tr><td><strong>Reference:</strong></td><td style="padding-left:12px;">${escape(order.order_number)}</td></tr>
    </table>
  </div>`;
}

function orderSummaryHtml(order: OrderLike): string {
  const items: OrderEmailItem[] = Array.isArray(order.items) ? order.items as OrderEmailItem[] : [];
  if (items.length === 0) return '';
  const totals = totalsBlock({
    order_number: order.order_number,
    payment_method: (order.payment_method === 'bank_transfer' ? 'bank_transfer' : 'stripe'),
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    shipping_address: order.shipping_address,
    items,
    subtotal: Number(order.subtotal || 0),
    shipping_cost: Number(order.shipping_cost || 0),
    discount_amount: Number(order.discount_amount || 0),
    gift_wrap_amount: 0,
    total: Number(order.total || 0),
  });
  return `${itemsTable(items)}${totals}`;
}

function shippingAddressHtml(order: OrderLike): string {
  if (!order.shipping_address) return '';
  return `<p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#6e6a62;margin:24px 0 6px;">Shipping to</p>
    <p style="font-family:'Lora',Georgia,serif;font-size:14px;color:#3D3D3A;line-height:1.6;white-space:pre-line;margin:0;">${escape(order.shipping_address)}</p>`;
}

function ctaButtonHtml(label: string, url: string): string {
  if (!label.trim() || !url.trim()) return '';
  return `<p style="margin:24px 0 8px;">
    <a href="${escape(url)}" style="display:inline-block;padding:12px 22px;background:#6E3A5A;color:#fff;text-decoration:none;font-family:'Josefin Sans',sans-serif;font-size:12px;letter-spacing:0.16em;text-transform:uppercase;">${escape(label)}</a>
  </p>`;
}

function renderTemplateHtml(template: EmailTemplate, ctx: MergeContext): string {
  const introHtml = richtextToHtml(template.intro, ctx);
  const outroHtml = richtextToHtml(template.outro, ctx);
  const hasOrder = !!ctx.order;
  const bankHtml = hasOrder && template.include_bank_details ? bankDetailsHtml(ctx.order!) : '';
  const summaryHtml = hasOrder && template.include_order_summary ? orderSummaryHtml(ctx.order!) : '';
  const addressHtml = hasOrder && template.include_shipping_address ? shippingAddressHtml(ctx.order!) : '';
  const ctaLabel = mergeTags(template.cta_label, ctx);
  const ctaUrl = mergeTags(template.cta_url, ctx);
  const ctaHtml = ctaButtonHtml(ctaLabel, ctaUrl);
  const heading = mergeTags(template.name, ctx);
  const preheader = mergeTags(template.preheader, ctx);
  const preheaderHidden = preheader
    ? `<div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;color:transparent;">${escape(preheader)}</div>`
    : '';
  const subheading = hasOrder
    ? `<p style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:22px;color:#1a1a18;margin:0 0 18px;">Order ${escape(ctx.order!.order_number)}</p>`
    : '';

  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#fafaf7;">
  ${preheaderHidden}
  <table role="presentation" style="width:100%;border-collapse:collapse;background:#fafaf7;padding:30px 20px;">
    <tr><td align="center">
      <table role="presentation" style="width:100%;max-width:600px;background:#fff;border-collapse:collapse;">
        <tr><td style="padding:32px 32px 24px;border-bottom:1px solid #ece6dc;">
          <h1 style="font-family:'Cormorant Garamond',Georgia,serif;font-weight:500;font-size:24px;color:#1a1a18;margin:0;letter-spacing:0.02em;">Anna Lou Wellness</h1>
        </td></tr>
        <tr><td style="padding:28px 32px;">
          <p style="font-family:'Josefin Sans',sans-serif;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#c4704a;margin:0 0 6px;">${escape(heading)}</p>
          ${subheading}
          ${introHtml}
          ${bankHtml}
          ${summaryHtml}
          ${addressHtml}
          ${outroHtml}
          ${ctaHtml}
        </td></tr>
        <tr><td style="padding:24px 32px;background:#f5f0e8;font-family:'Lora',Georgia,serif;font-size:13px;color:#6e6a62;line-height:1.6;">
          Questions? Reply to this email — we read every message.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function renderTemplateText(template: EmailTemplate, ctx: MergeContext): string {
  const introText = richtextToText(template.intro, ctx);
  const outroText = richtextToText(template.outro, ctx);
  const order = ctx.order;
  const items: OrderEmailItem[] = order && Array.isArray(order.items) ? order.items as OrderEmailItem[] : [];
  const lines: string[] = [
    mergeTags(template.name, ctx),
    order ? `Order ${order.order_number}` : '',
    '',
    introText,
    '',
  ];
  if (order && template.include_bank_details) {
    lines.push(
      'Bank transfer details:',
      `  Amount: ${money(order.total)}`,
      `  Reference: ${order.order_number}`,
      `  Account name: Anna Lou Wellness`,
      `  Sort code: XX-XX-XX`,
      `  Account number: XXXXXXXX`,
      `  IBAN: GB00 XXXX XXXX XXXX XXXX XX`,
      '',
    );
  }
  if (order && template.include_order_summary && items.length > 0) {
    lines.push('Items:');
    items.forEach((i) => lines.push(`  ${i.name} x${i.qty}  ${money(i.price * i.qty)}`));
    lines.push('');
    lines.push(`Subtotal: ${money(Number(order.subtotal || 0))}`);
    if (Number(order.discount_amount || 0) > 0) lines.push(`Discount: -${money(Number(order.discount_amount))}`);
    lines.push(`Shipping: ${Number(order.shipping_cost || 0) > 0 ? money(Number(order.shipping_cost)) : 'Free'}`);
    lines.push(`Total: ${money(Number(order.total))}`);
    lines.push('');
  }
  if (order && template.include_shipping_address && order.shipping_address) {
    lines.push('Shipping to:', order.shipping_address, '');
  }
  lines.push(outroText);
  const ctaLabel = mergeTags(template.cta_label, ctx);
  const ctaUrl = mergeTags(template.cta_url, ctx);
  if (ctaLabel && ctaUrl) {
    lines.push('', `${ctaLabel}: ${ctaUrl}`);
  }
  return lines.join('\n');
}

/**
 * Send an email built from a CMS-edited template. Returns { ok: false } and
 * logs if the template is missing or disabled — never throws.
 */
export async function sendFromTemplate(
  templateKey: string,
  ctx: MergeContext,
): Promise<{ ok: boolean; error?: string }> {
  const template = await fetchEmailTemplate(templateKey);
  if (!template) {
    console.warn(`[email] template "${templateKey}" not found — skipped`);
    return { ok: false, error: 'template_not_found' };
  }
  if (!template.enabled) {
    console.info(`[email] template "${templateKey}" disabled in CMS — skipped`);
    return { ok: false, error: 'template_disabled' };
  }
  const customerEmail = ctx.order?.customer_email || ctx.account?.email || '';
  const to = template.audience === 'admin' ? OWNER_EMAIL : customerEmail;
  if (!to) {
    console.warn(`[email] template "${templateKey}" has no recipient`);
    return { ok: false, error: 'no_recipient' };
  }
  const fallbackSubject = ctx.order
    ? `Order ${ctx.order.order_number}`
    : 'Anna Lou Wellness';
  const subject = mergeTags(template.subject, ctx) || fallbackSubject;
  const html = renderTemplateHtml(template, ctx);
  const text = renderTemplateText(template, ctx);
  return send({
    to,
    subject,
    html,
    text,
    replyTo: template.audience === 'admin' ? customerEmail : OWNER_EMAIL,
  });
}

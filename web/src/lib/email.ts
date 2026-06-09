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

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || 'Anna Lou Wellness <onboarding@resend.dev>';
const OWNER_EMAIL = process.env.OWNER_EMAIL || 'hello@annalouwellness.com';

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

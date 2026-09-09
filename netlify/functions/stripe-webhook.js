/* Runs when Stripe confirms a deposit has been paid.
   Sends the customer their order confirmation and the shop its prep sheet. */

const Stripe = require('stripe');
const S = require('./_shared.js');

async function sendEmail({ to, subject, html, text, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    console.error('email not configured — RESEND_API_KEY / MAIL_FROM missing');
    return { ok: false, reason: 'not-configured' };
  }
  const body = { from, to: Array.isArray(to) ? to : [to], subject, html, text };
  if (replyTo) { body.reply_to = replyTo; }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    console.error('email send failed', res.status, await res.text());
    return { ok: false, reason: 'send-failed' };
  }
  return { ok: true };
}

/* ---------------- email bodies ---------------- */

function customerEmail(o) {
  const rows = o.items.map(i =>
    `<tr><td style="padding:12px 0;border-bottom:1px solid #eee;color:#222;font-size:15px;">${S.escapeHtml(i)}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:28px 12px;">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e0d8;">
  <tr><td style="background:#0a0a0a;padding:26px 32px;text-align:center;">
    <div style="font-size:26px;letter-spacing:6px;color:#ffffff;font-weight:bold;">HIPKISS</div>
    <div style="font-size:10px;letter-spacing:3px;color:#C9933A;text-transform:uppercase;margin-top:6px;">Quality Butchers &middot; Delicatessen &middot; Farm Shop</div>
  </td></tr>
  <tr><td style="padding:32px 32px 8px;">
    <h1 style="margin:0 0 10px;font-size:22px;color:#111;">Your Christmas order is confirmed</h1>
    <p style="margin:0 0 22px;font-size:15px;line-height:1.65;color:#555;">Thanks ${S.escapeHtml(o.name)} — your deposit has gone through and your order is in the book.</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f4;border:1px solid #e8e2d6;margin-bottom:26px;">
      <tr><td style="padding:18px 22px;text-align:center;">
        <div style="font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5c;">Your order number</div>
        <div style="font-size:28px;letter-spacing:3px;color:#8a6520;font-weight:bold;margin-top:6px;">${S.escapeHtml(o.orderNumber)}</div>
        <div style="font-size:12px;color:#777;margin-top:8px;">Quote this when you collect</div>
      </td></tr>
    </table>

    <h2 style="margin:0 0 6px;font-size:13px;letter-spacing:2px;text-transform:uppercase;color:#8a6520;">Your Order</h2>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">${rows}</table>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;font-size:13px;color:#888;">Collection day</td>
          <td style="padding:9px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;text-align:right;font-weight:bold;">${S.escapeHtml(o.collectionDate)}</td></tr>
      <tr><td style="padding:9px 0;border-bottom:1px solid #eee;font-size:13px;color:#888;">Deposit paid</td>
          <td style="padding:9px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;text-align:right;font-weight:bold;">${S.escapeHtml(o.depositText)}</td></tr>
      <tr><td style="padding:9px 0;font-size:13px;color:#888;">Balance</td>
          <td style="padding:9px 0;font-size:14px;color:#222;text-align:right;">Paid in store on collection</td></tr>
    </table>
    ${o.notes ? `<p style="margin:18px 0 0;font-size:13px;color:#666;"><b style="color:#333;">Your notes:</b> ${S.escapeHtml(o.notes)}</p>` : ''}
  </td></tr>

  <tr><td style="padding:22px 32px 30px;">
    <div style="background:#faf8f4;border-left:3px solid #C9933A;padding:16px 20px;font-size:13px;line-height:1.7;color:#555;">
      Most of our meat is priced by weight, so we'll weigh and price your order when you collect, take off the deposit you've paid, and you settle the balance in store.
    </div>
    <p style="margin:22px 0 0;font-size:13px;line-height:1.8;color:#777;">
      Something not right? Call us on <a href="tel:01902965477" style="color:#8a6520;">${S.escapeHtml(S.SHOP.phone)}</a> and quote ${S.escapeHtml(o.orderNumber)}.
    </p>
  </td></tr>

  <tr><td style="background:#0a0a0a;padding:22px 32px;text-align:center;">
    <div style="font-size:12px;line-height:1.8;color:#999;">
      ${S.escapeHtml(S.SHOP.address)}<br>
      <a href="tel:01902965477" style="color:#C9933A;text-decoration:none;">${S.escapeHtml(S.SHOP.phone)}</a>
      &nbsp;&middot;&nbsp;
      <a href="${S.SHOP.site}" style="color:#C9933A;text-decoration:none;">hipkissbutchers.co.uk</a>
    </div>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;

  const text = [
    'HIPKISS FARM SHOP — CHRISTMAS ORDER CONFIRMED',
    '',
    'Thanks ' + o.name + ' — your deposit has gone through and your order is in the book.',
    '',
    'ORDER NUMBER: ' + o.orderNumber + '  (quote this when you collect)',
    '',
    'YOUR ORDER',
    ...o.items.map(i => '  - ' + i),
    '',
    'Collection day: ' + o.collectionDate,
    'Deposit paid:   ' + o.depositText,
    'Balance:        paid in store on collection',
    o.notes ? 'Your notes:     ' + o.notes : '',
    '',
    "Most of our meat is priced by weight, so we'll weigh and price your order",
    'when you collect, take off the deposit you have paid, and you settle the',
    'balance in store.',
    '',
    'Something not right? Call ' + S.SHOP.phone + ' and quote ' + o.orderNumber + '.',
    '',
    S.SHOP.address,
    S.SHOP.phone + ' · hipkissbutchers.co.uk'
  ].filter(Boolean).join('\n');

  return { subject: 'Your Hipkiss Christmas order ' + o.orderNumber, html, text };
}

function shopEmail(o) {
  const rows = o.items.map(i =>
    `<tr><td style="padding:10px 0;border-bottom:1px solid #eee;font-size:16px;color:#111;">${S.escapeHtml(i)}</td></tr>`
  ).join('');

  const html = `<!DOCTYPE html><html><body style="margin:0;font-family:Helvetica,Arial,sans-serif;background:#fff;padding:24px;">
<div style="max-width:620px;margin:0 auto;border:2px solid #111;">
  <div style="background:#111;color:#fff;padding:16px 22px;">
    <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#C9933A;">New Christmas Order</div>
    <div style="font-size:26px;font-weight:bold;letter-spacing:2px;margin-top:4px;">${S.escapeHtml(o.orderNumber)}</div>
  </div>
  <div style="padding:20px 22px;">
    <div style="background:#f5f2ea;border:1px solid #ddd6c4;padding:14px 18px;margin-bottom:20px;">
      <div style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#8a7a5c;">Collection</div>
      <div style="font-size:20px;font-weight:bold;color:#111;margin-top:3px;">${S.escapeHtml(o.collectionDate)}</div>
    </div>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">${rows}</table>
    <table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;">
      <tr><td style="padding:7px 0;color:#888;width:110px;">Customer</td><td style="padding:7px 0;color:#111;font-weight:bold;">${S.escapeHtml(o.name)}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Mobile</td><td style="padding:7px 0;color:#111;font-weight:bold;">${S.escapeHtml(o.phone)}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Email</td><td style="padding:7px 0;color:#111;">${S.escapeHtml(o.email)}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Items</td><td style="padding:7px 0;color:#111;">${S.escapeHtml(String(o.itemCount))}</td></tr>
      <tr><td style="padding:7px 0;color:#888;">Deposit paid</td><td style="padding:7px 0;color:#111;font-weight:bold;">${S.escapeHtml(o.depositText)}</td></tr>
    </table>
    ${o.notes ? `<div style="margin-top:18px;background:#fff8e6;border-left:3px solid #C9933A;padding:12px 16px;font-size:14px;color:#333;"><b>Customer notes:</b> ${S.escapeHtml(o.notes)}</div>` : ''}
  </div>
</div>
</body></html>`;

  const text = [
    'NEW CHRISTMAS ORDER — ' + o.orderNumber,
    '',
    'COLLECTION: ' + o.collectionDate,
    '',
    'ITEMS',
    ...o.items.map(i => '  - ' + i),
    '',
    'Customer:     ' + o.name,
    'Mobile:       ' + o.phone,
    'Email:        ' + o.email,
    'Items:        ' + o.itemCount,
    'Deposit paid: ' + o.depositText,
    o.notes ? 'Notes:        ' + o.notes : ''
  ].filter(Boolean).join('\n');

  return { subject: `[${o.orderNumber}] ${o.collectionDate.split(' ').slice(0, 2).join(' ')} — ${o.name} (${o.itemCount} items)`, html, text };
}

/* ---------------- handler ---------------- */

exports.handler = async (event) => {
  const secret = process.env.STRIPE_SECRET_KEY;
  const whsec = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !whsec) { return { statusCode: 500, body: 'Not configured.' }; }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
  const sig = event.headers['stripe-signature'];
  const raw = event.isBase64Encoded ? Buffer.from(event.body, 'base64') : event.body;

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(raw, sig, whsec);
  } catch (err) {
    console.error('signature verification failed', err.message);
    return { statusCode: 400, body: 'Invalid signature.' };
  }

  if (stripeEvent.type !== 'checkout.session.completed') {
    return { statusCode: 200, body: 'Ignored.' };
  }

  const session = stripeEvent.data.object;
  if (session.payment_status !== 'paid') {
    return { statusCode: 200, body: 'Not paid.' };
  }

  const m = session.metadata || {};
  const order = {
    orderNumber: m.order_number || session.client_reference_id || 'HIP-UNKNOWN',
    name: m.customer_name || '',
    phone: m.customer_phone || '',
    email: m.customer_email || session.customer_email || '',
    collectionDate: m.collection_date || '',
    itemCount: m.item_count || '',
    notes: m.notes || '',
    items: S.unpackItems(m),
    depositText: S.money(Number(m.deposit_pence || session.amount_total || 0))
  };

  const results = [];

  if (order.email) {
    const e = customerEmail(order);
    results.push(await sendEmail({
      to: order.email, subject: e.subject, html: e.html, text: e.text,
      replyTo: process.env.SHOP_EMAIL
    }));
  }

  if (process.env.SHOP_EMAIL) {
    const e = shopEmail(order);
    results.push(await sendEmail({
      to: process.env.SHOP_EMAIL.split(',').map(s => s.trim()).filter(Boolean),
      subject: e.subject, html: e.html, text: e.text,
      replyTo: order.email || undefined
    }));
  }

  console.log('order ' + order.name + ' ' + order.orderNumber + ' — emails: ' +
    JSON.stringify(results.map(r => r.ok)));

  /* Always 200 so Stripe does not retry a payment we have already taken.
     Any email failure is in the logs, and the order is safe in Stripe. */
  return { statusCode: 200, body: 'ok' };
};

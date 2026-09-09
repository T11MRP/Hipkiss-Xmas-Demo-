/* Creates the Stripe Checkout session for a Christmas order.
   Everything that decides the amount happens here, on the server —
   the browser only says WHICH catalogue items were picked. */

const Stripe = require('stripe');
const S = require('./_shared.js');

const MAX_BODY = 20000;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') { return S.json(405, { error: 'Method not allowed.' }); }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) {
    return S.json(500, { error: 'Payments are not configured yet.' });
  }
  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });

  if (!S.ordersOpen()) {
    return S.json(400, { error: 'Online Christmas orders have now closed.' });
  }

  let payload;
  try {
    if (!event.body || event.body.length > MAX_BODY) { throw new Error('bad body'); }
    payload = JSON.parse(event.body);
  } catch (e) {
    return S.json(400, { error: 'We could not read that order.' });
  }

  /* ---- validate the basket against the catalogue ---- */
  const raw = Array.isArray(payload.items) ? payload.items : [];
  if (!raw.length) { return S.json(400, { error: 'Your order is empty.' }); }

  const lines = [];
  for (const l of raw) {
    const resolved = S.resolveLine(l || {});
    if (!resolved) {
      return S.json(400, { error: 'One of those items is no longer available. Please refresh the page and try again.' });
    }
    lines.push(resolved);
  }

  const totalLines = lines.length;
  const totalItems = lines.reduce((n, l) => n + l.qty, 0);
  if (totalLines < 1 || totalLines > S.CATALOGUE.deposit.maxItems) {
    return S.json(400, { error: 'That is more items than we can take online. Please give us a ring on ' + S.SHOP.phone + '.' });
  }

  /* Reject the same option twice — the page cannot produce it, but a
     hand-crafted request could, and it would double a line on the prep sheet. */
  const seen = new Set();
  for (const l of lines) {
    const k = l.catId + '|' + l.itemId + '|' + l.optionId;
    if (seen.has(k)) { return S.json(400, { error: 'That order has a duplicate item in it.' }); }
    seen.add(k);
  }

  /* ---- customer ---- */
  const c = payload.customer || {};
  const name = String(c.name || '').trim().slice(0, 120);
  const phone = String(c.phone || '').trim().slice(0, 40);
  const email = String(c.email || '').trim().slice(0, 160);
  const notes = String(c.notes || '').trim().slice(0, 400);

  if (name.length < 2) { return S.json(400, { error: 'Please give us your name.' }); }
  if (phone.replace(/\D/g, '').length < 10) { return S.json(400, { error: 'Please give us a contact number.' }); }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { return S.json(400, { error: 'Please give us a valid email address.' }); }

  const date = S.CATALOGUE.collectionDates.find(d => d.id === payload.collectionDateId);
  if (!date) { return S.json(400, { error: 'Please choose a collection day.' }); }

  /* ---- amount ---- */
  const total = S.depositPence(totalItems);
  const currency = S.CATALOGUE.deposit.currency || 'gbp';
  const orderNumber = S.makeOrderNumber();

  const lineItems = [{
    quantity: 1,
    price_data: {
      currency,
      unit_amount: total,
      product_data: {
        name: 'Christmas order deposit',
        description: 'Secures your order — deducted from your final bill in store'
      }
    }
  }];

  const origin = process.env.SITE_URL ||
    (event.headers && (event.headers.origin || ('https://' + event.headers.host))) ||
    S.SHOP.site;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer_email: email,
      client_reference_id: orderNumber,
      success_url: origin + '/success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: origin + '/christmas.html?cancelled=1',
      line_items: lineItems,
      phone_number_collection: { enabled: false },
      metadata: Object.assign({
        order_number: orderNumber,
        customer_name: name,
        customer_phone: phone,
        customer_email: email,
        collection_date: date.label + (date.hours ? ' (' + date.hours + ')' : ''),
        item_count: String(totalItems),
        deposit_pence: String(total),
        notes: notes
      }, S.packItems(lines)),
      payment_intent_data: {
        description: 'Hipkiss Christmas order ' + orderNumber,
        metadata: { order_number: orderNumber }
      }
    });

    return S.json(200, { url: session.url, orderNumber });
  } catch (err) {
    console.error('checkout error', err);
    return S.json(502, { error: 'We could not start the payment.' });
  }
};

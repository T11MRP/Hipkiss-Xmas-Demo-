/* Feeds the thank-you page. Reads a completed Checkout Session back from
   Stripe so the order number shown after payment is the real one. */

const Stripe = require('stripe');
const S = require('./_shared.js');

exports.handler = async (event) => {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) { return S.json(500, { error: 'Not configured.' }); }

  const id = (event.queryStringParameters || {}).session_id || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(id)) { return S.json(400, { error: 'Bad reference.' }); }

  const stripe = new Stripe(secret, { apiVersion: '2024-06-20' });
  try {
    const session = await stripe.checkout.sessions.retrieve(id);
    if (session.payment_status !== 'paid') {
      return S.json(200, { paid: false });
    }
    const m = session.metadata || {};
    return S.json(200, {
      paid: true,
      orderNumber: m.order_number || session.client_reference_id || '',
      name: m.customer_name || '',
      email: m.customer_email || session.customer_email || '',
      collectionDate: m.collection_date || '',
      items: S.unpackItems(m),
      depositText: S.money(Number(m.deposit_pence || session.amount_total || 0)),
      notes: m.notes || ''
    });
  } catch (err) {
    console.error('lookup failed', err.message);
    return S.json(404, { error: 'Order not found.' });
  }
};

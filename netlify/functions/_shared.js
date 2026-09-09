/* Shared helpers for the Hipkiss Christmas order functions. */

const CATALOGUE = require('../../catalogue.js');

const SHOP = {
  name: 'Hipkiss Farm Shop',
  phone: '01902 965477',
  address: '25-26 Anders Square, Wolverhampton, WV6 7QH',
  site: 'https://hipkissbutchers.co.uk'
};

/* Order numbers: HIP- plus 6 characters, read out over the phone without
   ambiguity — no I/O/S/Z letters, no 0/1/2/5 digits. */
const ALPHABET = 'ABCDEFGHJKLMNPQRTUVWXY346789';
function makeOrderNumber() {
  const bytes = require('crypto').randomBytes(6);
  let out = '';
  for (let i = 0; i < 6; i++) { out += ALPHABET[bytes[i] % ALPHABET.length]; }
  return 'HIP-' + out;
}

/* Look an incoming line up in the catalogue. Returns null if it isn't real. */
function resolveLine(line) {
  const cat = CATALOGUE.categories.find(c => c.id === line.catId);
  if (!cat) { return null; }
  const item = cat.items.find(i => i.id === line.itemId);
  if (!item) { return null; }

  let optionLabel = '';
  let customWeight = null;
  let people = null;
  if (item.options && item.options.length) {
    const o = item.options.find(x => x.id === line.optionId);
    if (!o) { return null; }              // option required but not matched

    if (o.custom) {
      /* A weight the customer typed. Trust nothing about it: it has to be a
         real number, inside the range this item advertises, and no finer than
         the 100g we offered. */
      const cfg = item.custom || { min: 0.5, max: 10 };
      const rawW = line.customWeight;
      if (rawW === null || rawW === undefined || rawW === '') { return null; }
      if (line.people != null) { return null; }        // one route or the other
      const w = Number(rawW);
      if (!Number.isFinite(w)) { return null; }
      const r = Math.round(w * 10) / 10;
      if (Math.abs(r - w) > 1e-6) { return null; }
      if (r < cfg.min || r > cfg.max) { return null; }
      customWeight = r;
      optionLabel = String(r) + 'kg';

    } else if (o.people) {
      /* "Feeding this many — you size it." A whole number of people, inside
         the range this item can cover. */
      const cfg = item.people || { min: 1, max: 30 };
      const rawP = line.people;
      if (rawP === null || rawP === undefined || rawP === '') { return null; }
      if (line.customWeight != null) { return null; }  // one route or the other
      const n = Number(rawP);
      if (!Number.isInteger(n)) { return null; }
      if (n < cfg.min || n > cfg.max) { return null; }
      people = n;
      optionLabel = 'For ' + n + (n === 1 ? ' person' : ' people') + ' \u2014 butcher to size';

    } else {
      if (line.customWeight != null || line.people != null) { return null; }
      optionLabel = o.label;
    }
  } else if (line.optionId) {
    return null;                          // option sent for an item that has none
  } else if (line.customWeight != null || line.people != null) {
    return null;                          // sizing sent for an item with no sizes
  }

  /* Reject rather than round: a quantity we did not send is a quantity
     we should not silently reinterpret. */
  const qty = Number(line.qty);
  const maxQty = CATALOGUE.deposit.maxQtyPerItem || 10;
  if (!Number.isInteger(qty) || qty < 1 || qty > maxQty) { return null; }

  return { catId: cat.id, catName: cat.name, itemId: item.id, itemName: item.name,
           optionId: line.optionId || '', optionLabel, customWeight, people, qty };
}

/* Flat deposit — the same amount however many items are ordered. */
function depositPence(totalItems) {
  return totalItems < 1 ? 0 : CATALOGUE.deposit.amount;
}

function money(pence) {
  return '£' + (pence % 100 === 0 ? (pence / 100).toFixed(0) : (pence / 100).toFixed(2));
}

function lineText(l) {
  return l.qty + ' × ' + l.itemName + (l.optionLabel ? ' — ' + l.optionLabel : '') + '  [' + l.catName + ']';
}

function ordersOpen() {
  if (!CATALOGUE.ordersCloseISO) { return true; }
  const close = new Date(CATALOGUE.ordersCloseISO + 'T23:59:59Z');
  if (isNaN(close.getTime())) { return true; }
  return new Date() <= close;
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/* Stripe metadata values cap at 500 chars, so long orders are split
   across items_1, items_2 … and rejoined by the webhook. */
function packItems(lines) {
  const text = lines.map(lineText).join(' ;; ');
  const out = {};
  let i = 0, part = 1;
  while (i < text.length) { out['items_' + part] = text.slice(i, i + 480); i += 480; part++; }
  if (!Object.keys(out).length) { out.items_1 = ''; }
  return out;
}
function unpackItems(metadata) {
  let text = '', part = 1;
  while (metadata['items_' + part]) { text += metadata['items_' + part]; part++; }
  return text ? text.split(' ;; ') : [];
}

const json = (statusCode, body) => ({
  statusCode,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  body: JSON.stringify(body)
});

module.exports = {
  CATALOGUE, SHOP, makeOrderNumber, resolveLine, depositPence,
  money, lineText, ordersOpen, escapeHtml, packItems, unpackItems, json
};

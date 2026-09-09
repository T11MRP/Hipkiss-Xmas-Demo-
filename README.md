# Hipkiss Farm Shop — Christmas Orders (preview)

A preview of the Christmas ordering system for review. Everything here is
clickable end to end — **no payment is taken and no emails are sent.**

## What to look at

- **`index.html`** — the homepage, with the Christmas section under the hero.
- **`christmas.html`** — the ordering system. Open a counter, then open a
  product to see its choices. Turkey, poultry and trimmings are picked
  straight off a button; the joints ask for a weight, or how many people
  you're feeding. Once it's in, you get a **− 1 +** quantity stepper. Add
  your details, pick a collection day, and go through to the confirmation.
- **`success.html`** — the confirmation a customer sees after paying, with
  their order number.

## What we still need from the shop

1. **A read-back of the item list.** Every product is in `catalogue.js`,
   grouped the way it appears on the page. Worth a read-back of the names, and of
   **"Boneless Draft of Pork Joint"** in particular: "draft" is genuine Midlands
   butchery language rather than a typo, but it is trade language, so it may
   want a short line underneath saying what the cut is.
2. **A read-back of the joint sizing limits.** The beef, pork and lamb joints
   are sized by the customer — their own weight in kg, or a number of people
   for the butchers to size. Each joint has a kg range and a maximum headcount;
   those figures are **our starting suggestions, not the shop's** — they need
   Richard's eye before go-live.
3. **The orders-close date.** Currently set to Monday 7 December. Anything after that is taken in store.

## How it works

- A single **£20 deposit** secures the whole order, however much is added.
  It comes off the final bill; the balance is settled in store on collection.
- Collection days are the **21st–24th of December**.
- **Game, delicatessen and anything not listed** are in-store only.
- Every paid order emails the customer a confirmation with an order number,
  and emails the shop a prep sheet with the collection day in the subject
  line so the inbox sorts itself by day.

## Changing the menu

`catalogue.js` is the only file that decides what can be ordered. Categories
are the dropdown headings, items are what appears inside them, and `options`
are the buttons (a weight, a stuffing choice). Leave `options` out and the
item gets a plain **Add to order** button instead. An option can also carry a
`serves` line underneath its label, and the joints use two typed options —
`custom: true` opens the kg box (limited by `custom: { min, max }`) and
`people: true` opens the how-many-people box (limited by `people: { min, max }`).

## Note on this preview

This repo now holds the whole system, front end and server code together, and
it behaves differently depending on where it is served from.

On **GitHub Pages**, this address, it runs as a preview. The "Pay Deposit"
button skips straight to a sample confirmation, so the whole journey can be
clicked through without a card and without anything being charged. GitHub
Pages cannot run server code, so this address will always be a preview.

On **Netlify**, the same files run the real thing. The page checks the address
it is being served from and switches itself, so there is no flag to remember
and no chance of the two drifting apart.

The `netlify/functions/` folder holds the server code that takes the deposit
through Stripe and sends the two confirmation emails.

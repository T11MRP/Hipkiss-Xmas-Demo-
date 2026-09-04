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
   grouped the way it appears on the page. Worth checking the spelling of
   **"Boneless Draft of Pork Joint"** in particular.
1. **A read-back of the joint sizing limits.** The beef, pork and lamb joints
   are sized by the customer — their own weight in kg, or a number of people
   for the butchers to size. Each joint has a kg range and a maximum headcount;
   those figures are **our starting suggestions, not the shop's** — they need
   Richard's eye before go-live.
2. **The orders-close date.** Currently set to Monday 14 December.

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

This is the front end only. Taking real payments and sending confirmation
emails needs the two small server functions that sit alongside these files —
they aren't in this repo, and GitHub Pages could not run them anyway. On the
live site the "Pay Deposit" button goes to Stripe; here it skips straight to
a sample confirmation so the whole journey can be reviewed.

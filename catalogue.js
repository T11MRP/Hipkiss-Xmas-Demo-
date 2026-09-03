/* =====================================================================
   HIPKISS FARM SHOP — CHRISTMAS ORDER CATALOGUE
   ---------------------------------------------------------------------
   THIS IS THE ONLY FILE YOU EDIT TO CHANGE WHAT CUSTOMERS CAN ORDER.

   It is loaded by BOTH the website and the payment server, so the
   server can check every order against it.

   NO PRICES ANYWHERE. Customers pay a flat deposit online; everything
   else is priced in store on collection.

   HOW IT IS STRUCTURED
     categories[]      the dropdown headings (Turkey, Beef, Lamb...)
       .items[]        what appears when a customer opens that heading
         .options[]    the choices shown as buttons. ONE CLICK on an
                       option adds it to the order; clicking it again
                       removes it. Leave options out entirely and the
                       item gets a single "Add" button instead.
   ===================================================================== */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) { module.exports = factory(); }
  else { root.HIPKISS_CHRISTMAS = factory(); }
}(typeof self !== 'undefined' ? self : this, function () {

  return {

    /* Amber "draft menu" banner. Set true again if the list goes back for review. */
    draft: false,

    /* Flat deposit, in pence, however many items are ordered. 2000 = £20. */
    deposit: {
      currency: 'gbp',
      amount: 2000,
      maxItems: 25
    },

    /* CONFIRM WITH RICHARD before go-live. Orders stop at 23:59 on this date. */
    ordersCloseISO: '2026-12-14',
    ordersCloseLabel: 'Monday 14 December',

    collectionDates: [
      { id: 'dec21', label: 'Monday 21 December',    hours: '8am – 5pm' },
      { id: 'dec22', label: 'Tuesday 22 December',   hours: '8am – 5pm' },
      { id: 'dec23', label: 'Wednesday 23 December', hours: '8am – 5pm' },
      { id: 'dec24', label: 'Thursday 24 December',  hours: '8am – 1pm' }
    ],

    /* Shown as notices at the top of the order builder. */
    inStoreOnly: [
      { name: 'Game',            text: 'Please order all game meats in store.' },
      { name: 'Delicatessen',    text: 'Please order all delicatessen produce in store.' },
      { name: 'Anything Else',   text: 'Anything else you would like ordering, please pop in store.' }
    ],

    categories: [

      {
        id: 'turkey',
        name: 'Turkey',
        blurb: 'Crowns and whole birds, prepared in store.',
        items: [
          {
            id: 'crown-boneless',
            name: 'Boneless Turkey Crown',
            note: 'Variable weight — we’ll size it with you.',
            optionsLabel: 'Choose your stuffing',
            options: [
              { id: 'stuffing', label: 'With stuffing' },
              { id: 'sausage',  label: 'With sausage meat' },
              { id: 'none',     label: 'No stuffing' }
            ]
          },
          {
            id: 'crown-bacon',
            name: 'Boneless Turkey Crown Wrapped in Bacon',
            note: 'Variable weight — we’ll size it with you.',
            optionsLabel: 'Choose your stuffing',
            options: [
              { id: 'stuffing', label: 'With stuffing' },
              { id: 'sausage',  label: 'With sausage meat' },
              { id: 'none',     label: 'No stuffing' }
            ]
          },
          {
            id: 'turkey-whole',
            name: 'Whole Turkey',
            optionsLabel: 'Choose a weight',
            options: [
              { id: '4-5',   label: '4–5kg' },
              { id: '5-6',   label: '5–6kg' },
              { id: '6-7',   label: '6–7kg' },
              { id: '7-8',   label: '7–8kg' },
              { id: '8-9',   label: '8–9kg' },
              { id: '9-10',  label: '9–10kg' },
              { id: '10-11', label: '10–11kg' }
            ]
          },
          {
            id: 'turkey-bronze',
            name: 'Bronze Free Range Whole Turkey',
            optionsLabel: 'Choose a weight',
            options: [
              { id: '4-5', label: '4–5kg' },
              { id: '5-6', label: '5–6kg' },
              { id: '6-7', label: '6–7kg' },
              { id: '7-8', label: '7–8kg' },
              { id: '8-9', label: '8–9kg' }
            ]
          }
        ]
      },

      {
        id: 'poultry',
        name: 'Chicken, Duck & Goose',
        blurb: 'Whole birds, oven-ready.',
        items: [
          {
            id: 'chicken-whole',
            name: 'Whole Chicken',
            optionsLabel: 'Choose a weight',
            options: [
              { id: '1-6', label: '1.6kg' },
              { id: '1-8', label: '1.8kg' },
              { id: '2-0', label: '2.0kg' },
              { id: '2-2', label: '2.2kg +' }
            ]
          },
          {
            id: 'super-roaster',
            name: 'Super Roaster',
            optionsLabel: 'Choose a weight',
            options: [
              { id: '2-5', label: '2.5kg' },
              { id: '2-8', label: '2.8kg' },
              { id: '3-4', label: '3.4kg' },
              { id: '3-8', label: '3.8kg' },
              { id: '4-3', label: '4.3kg' },
              { id: '4-8', label: '4.8kg +' }
            ]
          },
          {
            id: 'duck-whole',
            name: 'Whole Duck',
            optionsLabel: 'Choose a weight',
            options: [
              { id: '2-1', label: '2.1kg' },
              { id: '2-3', label: '2.3kg' },
              { id: '2-5', label: '2.5kg' },
              { id: '2-7', label: '2.7kg' }
            ]
          },
          {
            id: 'goose',
            name: 'Goose',
            optionsLabel: 'Choose a weight',
            options: [
              { id: '4-5', label: '4–5kg' },
              { id: '5-6', label: '5–6kg' },
              { id: '6-7', label: '6–7kg' }
            ]
          }
        ]
      },

      {
        id: 'beef',
        name: 'Beef',
        blurb: 'Joints prepared by our butchers.',
        items: [
          { id: 'topside',        name: 'Topside of Beef Joint', sideNote: 'Weight chosen on collection' },
          { id: 'sirloin',        name: 'Sirloin of Beef Joint', sideNote: 'Weight chosen on collection' },
          { id: 'rib',            name: 'Rib of Beef Joint', sideNote: 'Weight chosen on collection' },
          { id: 'fillet',         name: 'Fillet of Beef Joint', sideNote: 'Weight chosen on collection' },
          { id: 'beef-wellington', name: 'Beef Wellington', sideNote: 'Weight chosen on collection' }
        ]
      },

      {
        id: 'pork',
        name: 'Pork & Gammon',
        blurb: 'Boneless joints and gammons.',
        items: [
          { id: 'loin-boneless',     name: 'Boneless Loin of Pork', sideNote: 'Weight chosen on collection' },
          { id: 'leg-boneless',      name: 'Boneless Leg of Pork', sideNote: 'Weight chosen on collection' },
          { id: 'shoulder-boneless', name: 'Boneless Shoulder of Pork', sideNote: 'Weight chosen on collection' },
          { id: 'draft-boneless',    name: 'Boneless Draft of Pork Joint', sideNote: 'Weight chosen on collection' },
          { id: 'gammon',            name: 'Gammon Joint', sideNote: 'Weight chosen on collection' },
          { id: 'gammon-honey',      name: 'Honey Glazed Gammon Joint', sideNote: 'Weight chosen on collection' }
        ]
      },

      {
        id: 'lamb',
        name: 'Lamb',
        blurb: 'On the bone or boned and rolled.',
        items: [
          { id: 'leg',              name: 'Leg of Lamb Joint', sideNote: 'Weight chosen on collection' },
          { id: 'leg-boneless',     name: 'Boneless Leg of Lamb Joint', sideNote: 'Weight chosen on collection' },
          { id: 'shoulder',         name: 'Shoulder of Lamb Joint', sideNote: 'Weight chosen on collection' },
          { id: 'shoulder-boneless', name: 'Boneless Shoulder of Lamb Joint', sideNote: 'Weight chosen on collection' },
          { id: 'rack',             name: 'Rack of Lamb', sideNote: 'Weight chosen on collection' }
        ]
      },

      {
        id: 'speciality',
        name: 'Speciality & Trimmings',
        blurb: 'The extras that make the table.',
        items: [
          {
            id: 'three-bird',
            name: '2kg Three Bird Roast',
            desc: 'Pheasant breast, duck breast and turkey breast.'
          },
          {
            id: 'pigs-blankets',
            name: 'Pigs in Blankets',
            note: 'Sold in trays of 10.',
            optionsLabel: 'How many trays?',
            options: [
              { id: '1', label: '1 tray (10)' },
              { id: '2', label: '2 trays (20)' },
              { id: '3', label: '3 trays (30)' },
              { id: '4', label: '4 trays (40)' }
            ]
          }
        ]
      }

    ]
  };
}));

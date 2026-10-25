/* PrimeLegacy catalogue + store settings.
   Edit STORE to change contact details used across the site and checkout. */
window.STORE = {
  name: 'PrimeLegacy',
  email: 'hello@primelegacy.com',
  phoneDisplay: '+92 300 0000000',
  whatsapp: '923000000000', // international format, digits only
  currency: 'Rs.',
  freeShippingAt: 5000
};

const APPAREL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const WAIST_SIZES = ['28', '30', '32', '34', '36', '38'];
const SCENT_SIZES = ['50 ml', '100 ml'];

window.CATEGORIES = {
  formal: 'Formal Shirts',
  casual: 'Casual Shirts',
  polos: 'Polos & Tees',
  bottoms: 'Bottoms',
  winter: 'The Winter Collection',
  tailoring: 'Tailoring',
  fragrance: 'Fragrance'
};

window.PRODUCTS = [
  // Fragrance
  { id: 'f1', name: 'Amber Oud Eau de Parfum', cat: 'fragrance', price: 6499, img: '1588405748880-12d1d2a59f75', sizes: SCENT_SIZES, tag: 'Bestseller', isNew: false, rank: 1,
    desc: 'Smoked oud and golden amber lifted with bergamot and pink pepper. A warm, long-lasting evening scent.' },
  { id: 'f2', name: 'Rose Velour Eau de Parfum', cat: 'fragrance', price: 5999, img: '1613521140785-e85e427f8002', sizes: SCENT_SIZES, isNew: true, rank: 6,
    desc: 'Damask rose softened by musk and a trail of sandalwood. Elegant, modern and quietly confident.' },
  { id: 'f3', name: 'Sandal Attar Oil — 12 ml', cat: 'fragrance', price: 2999, img: '1617897903246-719242758050', sizes: ['12 ml'], rank: 14,
    desc: 'Alcohol-free concentrated perfume oil of Mysore sandalwood and white musk. A few drops last all day.' },

  // Formal shirts
  { id: 's1', name: 'Oxford White Formal Shirt', cat: 'formal', price: 3999, img: '1598033129183-c4f50c736f10', sizes: APPAREL_SIZES, tag: 'Bestseller', rank: 2,
    desc: 'Crisp cotton Oxford weave with a semi-spread collar and slim tailored fit. The cornerstone of any wardrobe.' },
  { id: 's2', name: 'Sky Blue Formal Shirt', cat: 'formal', price: 3799, img: '1620012253295-c15cc3e65df4', sizes: APPAREL_SIZES, rank: 7,
    desc: 'Soft-hand poplin in a classic sky blue. Pairs effortlessly with navy, grey or charcoal tailoring.' },
  { id: 's3', name: 'Crisp White Poplin Shirt', cat: 'formal', price: 3699, oldPrice: 4299, img: '1603252109303-2751441dd157', sizes: APPAREL_SIZES, rank: 11,
    desc: 'Lightweight, breathable poplin with a clean placket and mother-of-pearl effect buttons.' },
  { id: 's4', name: 'The Essentials Shirt Trio', cat: 'formal', price: 9999, oldPrice: 11499, img: '1602810318383-e386cc2a3ccf', sizes: APPAREL_SIZES, isNew: true, rank: 9,
    desc: 'Three formal shirts — charcoal, ivory and burgundy — curated for a full working week. Save when you buy the set.' },

  // Casual shirts
  { id: 'c1', name: 'Highland Flannel Overshirt', cat: 'casual', price: 4299, img: '1607345366928-199ea26cfe3e', sizes: APPAREL_SIZES, isNew: true, rank: 4,
    desc: 'Brushed cotton flannel in a mustard and forest check. Wear it open over a tee or buttoned up on its own.' },
  { id: 'c2', name: 'Dotted Chambray Shirt', cat: 'casual', price: 3299, img: '1596755094514-f87e34085b2c', sizes: APPAREL_SIZES, rank: 13,
    desc: 'Washed chambray with a subtle micro-dot print. Relaxed, easy and made for weekends.' },
  { id: 'c3', name: 'Relaxed Oxford Shirt', cat: 'casual', price: 3499, img: '1588359348347-9bc6cbbb689e', sizes: APPAREL_SIZES, rank: 16,
    desc: 'A softer, garment-washed Oxford in pale blue with a button-down collar and roll-up sleeves.' },

  // Polos & tees
  { id: 'p1', name: 'Classic Piqué Polo', cat: 'polos', price: 2499, img: '1586363104862-3a5e2ab60d99', sizes: APPAREL_SIZES, tag: 'Bestseller', rank: 3,
    desc: 'Breathable cotton piqué with a ribbed collar and two-button placket. Available in seasonal colourways.' },
  { id: 'p2', name: 'Essential White Tee', cat: 'polos', price: 1699, img: '1521572163474-6864f9cf17ab', sizes: APPAREL_SIZES, rank: 8,
    desc: 'Heavyweight combed cotton that holds its shape wash after wash. The perfect white tee, finally.' },
  { id: 'p3', name: 'Midnight Crew Tee', cat: 'polos', price: 1699, img: '1618517351616-38fb9c5210c6', sizes: APPAREL_SIZES, rank: 12,
    desc: 'Our essential tee in deep black, with a refined crew neck and a tailored, not tight, fit.' },
  { id: 'p4', name: 'Teal Pocket Tee', cat: 'polos', price: 1799, img: '1633966887768-64f9a867bdba', sizes: APPAREL_SIZES, isNew: true, rank: 17,
    desc: 'Garment-dyed cotton in teal with a chest pocket and a contrast woven tab.' },

  // Bottoms
  { id: 'b1', name: 'Tailored Black Trousers', cat: 'bottoms', price: 4999, img: '1584865288642-42078afe6942', sizes: WAIST_SIZES, tag: 'Bestseller', rank: 5,
    desc: 'A tapered, ankle-grazing trouser in stretch twill. Smart enough for the office, easy enough for everything else.' },
  { id: 'b2', name: 'Khaki Stretch Chinos', cat: 'bottoms', price: 4499, img: '1473966968600-fa801b869a1a', sizes: WAIST_SIZES, rank: 10,
    desc: 'Slim-fit chinos with a touch of stretch for all-day comfort. Pairs with every top in your wardrobe.' },
  { id: 'b3', name: 'Indigo Straight Denim', cat: 'bottoms', price: 4799, img: '1624378439575-d8705ad7ae80', sizes: WAIST_SIZES, isNew: true, rank: 15,
    desc: 'Rigid indigo denim in a straight leg that softens and fades beautifully with wear.' },

  // Winter
  { id: 'w1', name: 'Camel Wool Overcoat', cat: 'winter', price: 14999, img: '1559582798-678dfc71ccd8', sizes: APPAREL_SIZES, isNew: true, tag: 'New', rank: 1.5,
    desc: 'A knee-length wool-blend overcoat in camel with notch lapels and a clean single-breasted front.' },
  { id: 'w2', name: 'Biker Leather Jacket', cat: 'winter', price: 18999, img: '1551028719-00167b16eac5', sizes: APPAREL_SIZES, rank: 18,
    desc: 'Supple lambskin in a classic asymmetric biker cut with silver-tone hardware.' },
  { id: 'w3', name: 'Rust Bomber Jacket', cat: 'winter', price: 8999, oldPrice: 10499, img: '1591047139829-d91aecb6caea', sizes: APPAREL_SIZES, rank: 19,
    desc: 'Lightweight bomber in burnt rust with ribbed trims and a utility sleeve pocket.' },
  { id: 'w4', name: 'Heritage Denim Jacket', cat: 'winter', price: 7499, img: '1611312449408-fcece27cdbb7', sizes: APPAREL_SIZES, isNew: true, rank: 20,
    desc: 'Dark-wash trucker jacket with a corduroy collar and a warm flannel lining.' },
  { id: 'w5', name: 'Cable Knit Sweater', cat: 'winter', price: 5499, img: '1631541909061-71e349d1f203', sizes: APPAREL_SIZES, rank: 21,
    desc: 'Chunky cable knit in oatmeal, soft against the skin and built for layering.' },
  { id: 'w6', name: 'Field Utility Jacket', cat: 'winter', price: 9499, img: '1548883354-94bcfe321cbb', sizes: APPAREL_SIZES, rank: 22,
    desc: 'Water-resistant olive shell with a hood, storm flap and four utility pockets.' },

  // Tailoring
  { id: 't1', name: 'Navy Windowpane Three-Piece', cat: 'tailoring', price: 34999, img: '1594938298603-c8148c4dae35', sizes: ['36', '38', '40', '42', '44'], isNew: true, rank: 23,
    desc: 'Jacket, waistcoat and trouser in a blue windowpane wool blend. Half-canvassed for a natural drape.' },
  { id: 't2', name: 'Emerald Two-Piece Suit', cat: 'tailoring', price: 32999, img: '1593032465175-481ac7f401a0', sizes: ['36', '38', '40', '42', '44'], rank: 24,
    desc: 'A statement suit in deep emerald with peak lapels, ideal for weddings and evening events.' }
];

window.LOOKBOOK = [
  { img: '1617137968427-85924c800a22', title: 'The Sharp Commute', product: 's1' },
  { img: '1552374196-1ab2a1c593e8', title: 'Camel & Cream', product: 'b2' },
  { img: '1516257984-b1b4d707412e', title: 'Weekend Denim', product: 'w4' },
  { img: '1617114919297-3c8ddb01f599', title: 'Tan Suede Hour', product: 'b3' },
  { img: '1534030347209-467a5b0ad3e6', title: 'Boardroom Blue', product: 't1' },
  { img: '1520975954732-35dd22299614', title: 'After Dark', product: 'w2' },
  { img: '1622519407650-3df9883f76a5', title: 'Off-Duty Black', product: 'p3' }
];

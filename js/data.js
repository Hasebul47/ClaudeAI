/*
 * Store configuration and product catalogue.
 * Edit this file to rename the shop, change currency, shipping rules,
 * coupons, categories and products. No other file needs to change.
 */
window.STORE = {
  name: 'Bloom & Hobby',
  tagline: "Ladies' essentials, special gifts & hobby goods",
  // Any ISO 4217 code + locale, e.g. currency: 'BDT', locale: 'en-BD'
  currency: 'USD',
  locale: 'en-US',
  freeShippingThreshold: 50,
  shipping: {
    standard: { label: 'Standard delivery', eta: '3–5 business days', price: 5 },
    express: { label: 'Express delivery', eta: '1–2 business days', price: 12 }
  },
  taxRate: 0.05,
  // Shows a "no payment is taken" notice at checkout. Set to false once a payment gateway is connected.
  demoMode: true,
  coupons: {
    WELCOME10: { type: 'percent', value: 10 },
    HOBBY5: { type: 'fixed', value: 5, minSubtotal: 25 }
  },
  contact: {
    email: 'hello@example.com',
    phone: '+1 (555) 010-0100',
    address: '123 Market Street, Your City',
    hours: 'Mon–Sat, 9am – 7pm'
  },
  social: { instagram: '#', facebook: '#' }
};

window.CATEGORIES = [
  {
    id: 'ladies',
    name: 'Ladies',
    title: "Ladies' Collection",
    blurb: 'Bags, jewellery, beauty and fashion picked for her.',
    emoji: '👜',
    bg: ['#f9dce5', '#f0b3c7']
  },
  {
    id: 'special',
    name: 'Special Items',
    title: 'Special Items',
    blurb: 'Gift boxes, limited editions and personalised keepsakes.',
    emoji: '🎁',
    bg: ['#fbecd0', '#f2cd8a']
  },
  {
    id: 'hobby',
    name: 'Hobby',
    title: 'Hobby Corner',
    blurb: 'Art, craft, garden and music kits to make something new.',
    emoji: '🎨',
    bg: ['#d9efe3', '#a7d7bf']
  }
];

/*
 * Product fields:
 *   id, name, category (ladies|special|hobby), sub, price, oldPrice?, rating,
 *   reviews, badge?, emoji, bg [from, to], stock, colors? [{name, hex}],
 *   sizes? [], description, features [], featured?, added (higher = newer),
 *   image? (optional URL — replaces the emoji artwork when set)
 */
window.PRODUCTS = [
  // ---------- Ladies ----------
  {
    id: 'quilted-shoulder-bag',
    name: 'Quilted Leather Shoulder Bag',
    category: 'ladies', sub: 'Handbags',
    price: 89, oldPrice: 119, rating: 4.8, reviews: 214, badge: 'Best seller',
    emoji: '👜', bg: ['#fbe1ea', '#eeb1c4'], stock: 18, featured: true, added: 20,
    colors: [{ name: 'Blush', hex: '#e9b3c2' }, { name: 'Black', hex: '#232023' }, { name: 'Camel', hex: '#c39a6b' }],
    description: 'A soft quilted shoulder bag in genuine leather with a gold-tone chain strap. Roomy enough for your phone, wallet and essentials, elegant enough for evenings out.',
    features: ['Genuine lambskin leather', 'Detachable chain strap', 'Magnetic flap closure', '2 inner pockets', 'W 26 × H 17 × D 8 cm']
  },
  {
    id: 'pearl-drop-earrings',
    name: 'Pearl Drop Earrings',
    category: 'ladies', sub: 'Jewellery',
    price: 34, rating: 4.7, reviews: 132, badge: 'New',
    emoji: '💎', bg: ['#eef0fb', '#c9cff2'], stock: 40, featured: true, added: 26,
    colors: [{ name: 'Gold', hex: '#d4af37' }, { name: 'Silver', hex: '#c0c0c0' }],
    description: 'Freshwater pearls on hypoallergenic 18k-plated hooks. A timeless pair that goes from office to occasion.',
    features: ['Freshwater pearls', '18k gold or rhodium plating', 'Nickel-free', 'Gift pouch included']
  },
  {
    id: 'silk-floral-scarf',
    name: 'Silk Floral Scarf',
    category: 'ladies', sub: 'Accessories',
    price: 29, rating: 4.5, reviews: 88,
    emoji: '🧣', bg: ['#fde4d6', '#f5b99a'], stock: 25, added: 12,
    colors: [{ name: 'Coral', hex: '#f08a6c' }, { name: 'Sage', hex: '#9db59a' }, { name: 'Navy', hex: '#2f3e66' }],
    description: 'A lightweight square scarf with a hand-painted floral print. Wear it in your hair, on your bag, or around your neck.',
    features: ['100% mulberry silk', '70 × 70 cm', 'Hand-rolled edges', 'Dry clean only']
  },
  {
    id: 'rose-gold-watch',
    name: 'Rose Gold Minimalist Watch',
    category: 'ladies', sub: 'Watches',
    price: 129, oldPrice: 149, rating: 4.9, reviews: 176,
    emoji: '⌚', bg: ['#fbe6dc', '#e9b9a3'], stock: 9, featured: true, added: 18,
    description: 'A slim 32 mm case with a sunray dial and a mesh strap that adjusts in seconds. Water-resistant for everyday wear.',
    features: ['Japanese quartz movement', 'Sapphire-coated glass', '3 ATM water resistance', 'Adjustable mesh strap', '2-year warranty']
  },
  {
    id: 'velvet-lipstick-set',
    name: 'Velvet Matte Lipstick Set',
    category: 'ladies', sub: 'Beauty',
    price: 24, oldPrice: 32, rating: 4.6, reviews: 301,
    emoji: '💄', bg: ['#fcdde3', '#ec9aac'], stock: 60, added: 15,
    description: 'Four long-wear matte shades — nude, rose, berry and classic red — in a creamy formula that never feels dry.',
    features: ['4 × 3.5 g lipsticks', 'Vitamin E enriched', 'Cruelty-free', 'Up to 8 hours wear']
  },
  {
    id: 'block-heel-sandals',
    name: 'Classic Block Heel Sandals',
    category: 'ladies', sub: 'Shoes',
    price: 59, rating: 4.4, reviews: 97,
    emoji: '👡', bg: ['#f6e4d4', '#ddb48c'], stock: 22, added: 10,
    colors: [{ name: 'Tan', hex: '#c58b5a' }, { name: 'Black', hex: '#232023' }],
    sizes: ['36', '37', '38', '39', '40', '41'],
    description: 'A comfortable 6 cm block heel with a padded footbed and an adjustable ankle strap — made for all-day wear.',
    features: ['Vegan leather upper', 'Cushioned insole', 'Non-slip rubber sole', '6 cm heel']
  },
  {
    id: 'wide-brim-sun-hat',
    name: 'Wide-Brim Straw Sun Hat',
    category: 'ladies', sub: 'Accessories',
    price: 27, rating: 4.3, reviews: 64,
    emoji: '👒', bg: ['#fbf0cf', '#ecd38b'], stock: 30, added: 8,
    description: 'A packable woven straw hat with a ribbon band. UPF 50+ sun protection for beach days and garden parties.',
    features: ['Natural paper straw', 'UPF 50+', 'Inner adjustable band', 'Packable brim']
  },
  {
    id: 'floral-eau-de-parfum',
    name: 'Floral Eau de Parfum 50 ml',
    category: 'ladies', sub: 'Beauty',
    price: 64, rating: 4.8, reviews: 189, badge: 'New',
    emoji: '🌸', bg: ['#fde3ef', '#f2a8c8'], stock: 35, featured: true, added: 25,
    description: 'Peony, pear and white musk come together in a soft, long-lasting scent that feels like spring.',
    features: ['50 ml spray', 'Top: pear · Heart: peony · Base: musk', 'Long-lasting 6–8 h', 'Made in France']
  },
  {
    id: 'linen-midi-dress',
    name: 'Embroidered Linen Midi Dress',
    category: 'ladies', sub: 'Clothing',
    price: 49, oldPrice: 65, rating: 4.5, reviews: 73,
    emoji: '👗', bg: ['#e2eef8', '#a8c8e4'], stock: 16, added: 14,
    colors: [{ name: 'Sky', hex: '#8fb6db' }, { name: 'Ivory', hex: '#efe6d6' }],
    sizes: ['S', 'M', 'L', 'XL'],
    description: 'Breathable linen-cotton midi dress with delicate embroidery at the yoke and a relaxed, flattering fit.',
    features: ['55% linen, 45% cotton', 'Side pockets', 'Machine washable', 'Model wears size S']
  },

  // ---------- Special items ----------
  {
    id: 'spa-gift-box',
    name: 'Pamper Me Spa Gift Box',
    category: 'special', sub: 'Gift Sets',
    price: 55, rating: 4.9, reviews: 248, badge: 'Best seller',
    emoji: '🎁', bg: ['#fbe5d8', '#f0b892'], stock: 20, featured: true, added: 22,
    description: 'A ready-to-give box with a bath bomb trio, rose body butter, a scented candle and a soft satin eye mask.',
    features: ['Gift-wrapped with a handwritten card', '6 hand-picked items', 'Vegan and cruelty-free', 'Ships in 24 h']
  },
  {
    id: 'personalised-name-necklace',
    name: 'Personalised Name Necklace',
    category: 'special', sub: 'Personalised',
    price: 45, rating: 4.7, reviews: 156,
    emoji: '✨', bg: ['#fff1cc', '#f2cf6b'], stock: 50, added: 19,
    colors: [{ name: 'Gold', hex: '#d4af37' }, { name: 'Rose gold', hex: '#d9a089' }, { name: 'Silver', hex: '#c0c0c0' }],
    description: 'Her name in a flowing script on a fine 45 cm chain. Add the name in the order notes at checkout.',
    features: ['Stainless steel, 18k plated', 'Up to 10 letters', '45 cm chain with extender', 'Tarnish resistant']
  },
  {
    id: 'handmade-ceramic-vase',
    name: 'Limited Edition Ceramic Vase',
    category: 'special', sub: 'Limited Edition',
    price: 72, rating: 5, reviews: 41, badge: 'Limited',
    emoji: '🏺', bg: ['#f4e3d7', '#d7a98a'], stock: 4, featured: true, added: 24,
    description: 'Each vase is wheel-thrown and glazed by hand in a small studio run of 50. No two are exactly alike.',
    features: ['Hand-thrown stoneware', 'Signed and numbered', 'H 22 cm', 'Watertight glaze']
  },
  {
    id: 'scented-candle-trio',
    name: 'Scented Soy Candle Trio',
    category: 'special', sub: 'Home & Gifts',
    price: 32, oldPrice: 39, rating: 4.6, reviews: 122,
    emoji: '🕯️', bg: ['#fdf0dc', '#eecf99'], stock: 28, added: 11,
    description: 'Three soy-wax candles — vanilla bean, lavender and fig — in reusable amber jars. About 30 hours each.',
    features: ['100% soy wax', 'Cotton wicks', '3 × 140 g', 'Reusable glass jars']
  },
  {
    id: 'chocolate-tea-hamper',
    name: 'Chocolate & Tea Hamper',
    category: 'special', sub: 'Gift Sets',
    price: 48, rating: 4.7, reviews: 95,
    emoji: '🍫', bg: ['#f1e0d6', '#c9967a'], stock: 14, added: 16,
    description: 'Artisan truffles, three loose-leaf teas and a glass infuser mug, packed in a keepsake wooden crate.',
    features: ['12 hand-made truffles', '3 loose-leaf teas', 'Glass infuser mug', 'Wooden crate']
  },
  {
    id: 'pressed-flower-frame',
    name: 'Pressed Flower Photo Frame',
    category: 'special', sub: 'Personalised',
    price: 26, rating: 4.5, reviews: 58, badge: 'New',
    emoji: '🖼️', bg: ['#e8f2e1', '#b9d6a4'], stock: 19, added: 23,
    description: 'Real pressed wildflowers set in glass around a 10 × 15 cm photo. A thoughtful gift for birthdays and anniversaries.',
    features: ['Real pressed flowers', 'Fits 10 × 15 cm photo', 'Stand or wall mount', 'Oak-finish frame']
  },
  {
    id: 'festive-jewellery-box',
    name: 'Velvet Jewellery Box',
    category: 'special', sub: 'Seasonal',
    price: 38, oldPrice: 46, rating: 4.6, reviews: 84,
    emoji: '💍', bg: ['#ece2f6', '#bfa5e0'], stock: 12, added: 9,
    colors: [{ name: 'Lilac', hex: '#b9a0dd' }, { name: 'Emerald', hex: '#2f7d62' }],
    description: 'A two-tier velvet jewellery box with ring rolls, earring slots and a mirror lid. Perfect for gifting season.',
    features: ['Soft velvet lining', 'Removable top tray', 'Built-in mirror', '20 × 14 × 9 cm']
  },

  // ---------- Hobby ----------
  {
    id: 'watercolour-paint-set',
    name: 'Watercolour Paint Set — 36 Colours',
    category: 'hobby', sub: 'Art & Painting',
    price: 39, oldPrice: 49, rating: 4.8, reviews: 267, badge: 'Best seller',
    emoji: '🎨', bg: ['#dff0f6', '#9ccfe2'], stock: 33, featured: true, added: 21,
    description: 'Highly pigmented pan watercolours with 2 water brushes and a pad of 300 gsm cold-press paper — everything you need to start.',
    features: ['36 half pans', '2 refillable water brushes', '20-sheet 300 gsm pad', 'Travel tin with mixing palette']
  },
  {
    id: 'beginner-knitting-kit',
    name: 'Beginner Knitting Kit',
    category: 'hobby', sub: 'Knitting & Crochet',
    price: 35, rating: 4.7, reviews: 143, badge: 'New',
    emoji: '🧶', bg: ['#fbe0e0', '#eea3a3'], stock: 26, featured: true, added: 27,
    colors: [{ name: 'Rose', hex: '#e79aa3' }, { name: 'Oat', hex: '#d9c8ad' }, { name: 'Moss', hex: '#7c9a6d' }],
    description: 'Knit your first cosy scarf. Includes chunky merino-blend yarn, bamboo needles and an illustrated step-by-step guide.',
    features: ['3 × 100 g merino-blend yarn', '8 mm bamboo needles', 'Illustrated guide + video link', 'Darning needle and markers']
  },
  {
    id: 'embroidery-starter-kit',
    name: 'Embroidery Hoop Starter Kit',
    category: 'hobby', sub: 'Needlework',
    price: 22, rating: 4.6, reviews: 119,
    emoji: '🪡', bg: ['#f3e6f7', '#d1a9e2'], stock: 45, added: 13,
    description: 'A pre-printed floral pattern, 12 colours of thread, a beech hoop and needles — a relaxing evening project.',
    features: ['Pre-printed cotton fabric', '20 cm beech hoop', '12 thread colours', 'Pattern guide']
  },
  {
    id: 'indoor-herb-garden',
    name: 'Indoor Herb Garden Kit',
    category: 'hobby', sub: 'Gardening',
    price: 31, rating: 4.5, reviews: 102,
    emoji: '🌿', bg: ['#e1f2df', '#a3d39c'], stock: 21, added: 17,
    description: 'Grow basil, mint, parsley and coriander on your windowsill. Includes ceramic pots, soil discs and seeds.',
    features: ['4 ceramic pots with trays', 'Organic seeds', 'Coir soil discs', 'Growing guide']
  },
  {
    id: 'dotted-journal-set',
    name: 'Dotted Journal & Pen Set',
    category: 'hobby', sub: 'Journaling',
    price: 19, rating: 4.7, reviews: 211,
    emoji: '📓', bg: ['#eee8de', '#cdbb9c'], stock: 70, added: 7,
    description: 'A lay-flat A5 dotted journal with 12 fine-liner pens, a stencil and washi tape. Plan, doodle and dream.',
    features: ['A5, 160 pages, 120 gsm', '12 fine-liner pens', 'Stencil and 4 washi tapes', 'Elastic closure']
  },
  {
    id: 'instant-camera',
    name: 'Instant Film Camera',
    category: 'hobby', sub: 'Photography',
    price: 79, oldPrice: 95, rating: 4.6, reviews: 158,
    emoji: '📷', bg: ['#e4ebf5', '#aebfde'], stock: 0, added: 6,
    colors: [{ name: 'Mint', hex: '#a6dcc8' }, { name: 'Pink', hex: '#f3b3c6' }],
    description: 'Point, shoot and hold the print in seconds. Automatic exposure, selfie mirror and a built-in flash.',
    features: ['Auto exposure', 'Selfie mirror', 'Uses mini instant film', '10 sheets of film included']
  },
  {
    id: 'macrame-kit',
    name: 'Macramé Wall Hanging Kit',
    category: 'hobby', sub: 'Crafts & DIY',
    price: 28, rating: 4.4, reviews: 67,
    emoji: '🪢', bg: ['#f5ece0', '#dbc3a1'], stock: 17, added: 5,
    description: 'Make a boho wall hanging in an afternoon. Natural cotton cord, a wooden dowel and a beginner-friendly pattern.',
    features: ['5 mm natural cotton cord', '40 cm wooden dowel', 'Pattern with knot glossary', 'Finished size ≈ 35 × 70 cm']
  },
  {
    id: 'ukulele-bundle',
    name: 'Ukulele Starter Bundle',
    category: 'hobby', sub: 'Music',
    price: 65, rating: 4.7, reviews: 91,
    emoji: '🎸', bg: ['#fbe9d7', '#e9b47f'], stock: 11, added: 4,
    description: 'A soprano ukulele with a padded gig bag, clip-on tuner, spare strings and a songbook for beginners.',
    features: ['Mahogany soprano ukulele', 'Padded gig bag', 'Clip-on tuner', 'Spare strings + songbook']
  },
  {
    id: 'jigsaw-puzzle',
    name: 'Botanical Jigsaw Puzzle — 1000 pcs',
    category: 'hobby', sub: 'Puzzles & Games',
    price: 21, rating: 4.8, reviews: 134,
    emoji: '🧩', bg: ['#e3efe8', '#9fcbb3'], stock: 38, added: 3,
    description: 'A vintage botanical illustration on thick recycled board. Pieces lock firmly and every one is unique.',
    features: ['1000 pieces', 'Finished size 68 × 49 cm', 'Recycled board', 'Poster included']
  },
  {
    id: 'cake-decorating-set',
    name: 'Cake Decorating Set',
    category: 'hobby', sub: 'Baking',
    price: 33, rating: 4.5, reviews: 76,
    emoji: '🧁', bg: ['#fde6ee', '#f2abc3'], stock: 24, added: 2,
    description: 'Piping bags, 24 stainless nozzles, a turntable and spatulas — create bakery-style cakes at home.',
    features: ['24 stainless steel nozzles', 'Rotating turntable', '50 disposable piping bags', '3 spatulas + scrapers']
  }
];

window.TESTIMONIALS = [
  { name: 'Ayesha R.', text: 'The quilted bag is even prettier in person, and it arrived beautifully wrapped. Already ordering a second one for my sister!', rating: 5, item: 'Quilted Leather Shoulder Bag' },
  { name: 'Mariam K.', text: 'I bought the knitting kit as a complete beginner. The guide is so clear — I finished my first scarf in a weekend.', rating: 5, item: 'Beginner Knitting Kit' },
  { name: 'Sophie L.', text: 'The spa gift box was the perfect last-minute birthday present. Fast delivery and lovely quality products.', rating: 4.5, item: 'Pamper Me Spa Gift Box' }
];

window.SAMPLE_REVIEWS = [
  { name: 'Nadia', rating: 5, title: 'Absolutely love it', text: 'Exactly as described and the quality is wonderful. Packaging was gorgeous too.' },
  { name: 'Emily', rating: 4, title: 'Great value', text: 'Really happy with this. Delivery took a couple of days longer than expected but worth the wait.' },
  { name: 'Farah', rating: 5, title: 'Perfect gift', text: 'Bought this as a gift and she was thrilled. Will definitely shop here again.' },
  { name: 'Grace', rating: 4.5, title: 'Lovely', text: 'Beautiful finish and feels premium. I would recommend it to friends.' }
];

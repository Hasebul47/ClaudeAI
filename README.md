# Bloom & Hobby — responsive e-commerce storefront

A fully responsive online shop for **ladies' items**, **special items** (gift boxes, limited editions, personalised keepsakes) and **hobby supplies** (art, knitting, gardening, music and more).

It is plain HTML, CSS and JavaScript with no build step and no dependencies. Open `index.html` in a browser and it works.

## Pages

| Page | What it does |
| --- | --- |
| `index.html` | Home: hero, category cards, featured / new / best-seller / sale tabs, special-items promo with countdown, hobby corner, testimonials, newsletter |
| `shop.html` | Product listing with search, category / type / price / rating / stock / sale filters, sorting, filter chips and "load more". Filters are kept in the URL (e.g. `shop.html?cat=hobby&sale=1`) |
| `product.html?id=…` | Product detail: gallery, colour & size options, quantity, add to cart, buy now, wishlist, description / details / reviews / shipping tabs, related products |
| `cart.html` | Cart with quantity editing, discount codes, free-shipping progress, tax and totals |
| `checkout.html` | Contact, address, delivery method, payment method, gift wrap and notes, with validation and an order confirmation screen |
| `wishlist.html` | Saved items, with "add all to cart" |
| `contact.html` | Contact details, a contact form (opens the visitor's email app) and FAQ |

Other features:
- Slide-out mini cart and mobile menu.
- Filters open as a bottom sheet on phones.
- Toast notifications.
- Cart and wishlist are saved in the browser (`localStorage`) and stay in sync across tabs.
- Accessible markup: keyboard navigation, focus states, ARIA labels and reduced-motion support.

Layouts are tested at 375 px (phone), 820 px (tablet) and 1366 px (desktop).

## Project structure

```
index.html  shop.html  product.html  cart.html  checkout.html  wishlist.html  contact.html
css/style.css     all styles (mobile-first, CSS variables at the top for colours & fonts)
js/data.js        ← store settings + all products (edit this file to customise the shop)
js/app.js         shared logic: header/footer, cart, wishlist, coupons, drawers, toasts
js/home.js  js/shop.js  js/product.js  js/cart.js  js/checkout.js   page scripts
```

## Run locally

Double-click `index.html`, or serve the folder:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Customise

Everything lives in **`js/data.js`**:

- **Shop name, contact details, social links:** `window.STORE`.
- **Currency:** set `currency` and `locale`. For example, Bangladeshi Taka is `currency: 'BDT', locale: 'en-BD'`.
- **Shipping and tax:** `freeShippingThreshold`, `shipping.standard`, `shipping.express`, `taxRate`.
- **Discount codes:** `coupons`. These ship with the store:
  - `WELCOME10`: 10% off.
  - `HOBBY5`: 5 off orders of 25 or more.
- **Categories:** `window.CATEGORIES`.
- **Products:** `window.PRODUCTS`. Each product has a name, category, type (`sub`), price, optional `oldPrice` (shows a sale badge), rating, stock, optional `colors` / `sizes`, a description and a feature list.

### Using real product photos

Products show a coloured emoji illustration by default. To use photos, put them in an `images/` folder and add an `image` field to the product:

```js
{ id: 'quilted-shoulder-bag', name: 'Quilted Leather Shoulder Bag', image: 'images/quilted-bag.jpg', ... }
```

Square images (e.g. 800×800) look best.

### Colours and fonts

Edit the CSS variables at the top of `css/style.css` (`--primary`, `--bg`, `--ink`, `--font-display`, …).

## Deploy for free (GitHub Pages)

1. Push this repository to GitHub.
2. Go to **Settings → Pages**.
3. Choose **Deploy from a branch**, then pick the branch and `/ (root)`.
4. Your shop will be live at `https://<username>.github.io/<repo>/`.

Netlify, Vercel or Cloudflare Pages also work: drag and drop the folder, with no build command.

## Before taking real orders

This is a complete front end. Right now orders are saved only in the customer's browser, and `demoMode: true` shows a "no payment is taken" notice at checkout. To run it as a live business:

1. **Payments:** connect a payment gateway (e.g. Stripe, PayPal, or a local provider such as SSLCommerz / bKash). Hook it into `onSubmit` in `js/checkout.js`, then set `demoMode: false`.
2. **Orders:** send the `order` object built in `js/checkout.js` to a backend, or to a service such as Firebase, Supabase, or an email/form service, so you receive each order.
3. **Contact form:** it currently opens the visitor's email app. To receive messages directly, point the form at a service such as Formspree.
4. Replace the sample products, reviews, testimonials and contact details with your own.

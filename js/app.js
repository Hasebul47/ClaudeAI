/*
 * Shared store logic: storage, cart, wishlist, header/footer, drawers,
 * toasts and product card rendering. Exposed as window.App.
 */
(function () {
  'use strict';

  const S = window.STORE;
  const PRODUCTS = window.PRODUCTS;
  const CATEGORIES = window.CATEGORIES;
  const KEYS = { cart: 'bh_cart', wish: 'bh_wishlist', coupon: 'bh_coupon', orders: 'bh_orders', newsletter: 'bh_newsletter' };

  // ---------- Utilities ----------
  const fmt = new Intl.NumberFormat(S.locale, { style: 'currency', currency: S.currency });
  const money = (n) => fmt.format(n);
  const round2 = (n) => Math.round(n * 100) / 100;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));
  const params = () => new URLSearchParams(location.search);

  const storage = {
    get(key, fallback) {
      try {
        const v = localStorage.getItem(key);
        return v ? JSON.parse(v) : fallback;
      } catch (e) {
        return fallback;
      }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (e) { /* storage unavailable */ }
    }
  };

  const byId = (id) => PRODUCTS.find((p) => p.id === id);
  const category = (id) => CATEGORIES.find((c) => c.id === id);

  // ---------- Icons (stroke icons, 24×24) ----------
  const ICONS = {
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    search: '<circle cx="11" cy="11" r="7.5"/><path d="m20.5 20.5-4.2-4.2"/>',
    heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    bag: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>',
    close: '<path d="M18 6 6 18M6 6l12 12"/>',
    plus: '<path d="M5 12h14M12 5v14"/>',
    minus: '<path d="M5 12h14"/>',
    trash: '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    returns: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
    chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13"/><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/><path d="M7.5 8a2.5 2.5 0 0 1 0-5C10 3 12 8 12 8s2-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    chevronRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowRight: '<path d="M5 12h14M12 5l7 7-7 7"/>',
    arrowUp: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    filter: '<path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    mail: '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    pin: '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
    clock: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    instagram: '<rect width="20" height="20" x="2" y="2" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><path d="M17.5 6.5h.01"/>',
    facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    tag: '<path d="M12.59 2.59A2 2 0 0 0 11.17 2H4a2 2 0 0 0-2 2v7.17a2 2 0 0 0 .59 1.42l8.7 8.7a2.43 2.43 0 0 0 3.42 0l6.58-6.58a2.43 2.43 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>'
  };
  const icon = (name, cls = '') =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name] || ''}</svg>`;

  // ---------- Product fragments ----------
  function productArt(p, opts = {}) {
    if (p.image) return `<img class="art art--img" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">`;
    const angle = opts.angle == null ? 135 : opts.angle;
    const scale = opts.scale || 1;
    return `<div class="art" style="--a:${p.bg[0]};--b:${p.bg[1]};--angle:${angle}deg;--scale:${scale}" aria-hidden="true"><span class="art__emoji">${p.emoji}</span></div>`;
  }

  function stars(rating, reviews) {
    const label = `Rated ${rating} out of 5${reviews != null ? `, ${reviews} reviews` : ''}`;
    return `<span class="rating" role="img" aria-label="${label}"><span class="stars" style="--rating:${rating}"></span>${reviews != null ? `<span class="rating__count">(${reviews})</span>` : ''}</span>`;
  }

  const discountPct = (p) => (p.oldPrice ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);

  function priceHtml(p, cls = '') {
    return `<span class="price ${cls}"><span class="price__now">${money(p.price)}</span>${p.oldPrice ? `<s class="price__old">${money(p.oldPrice)}</s>` : ''}</span>`;
  }

  function badges(p) {
    const out = [];
    if (p.stock === 0) out.push('<span class="badge badge--muted">Sold out</span>');
    else if (p.badge) out.push(`<span class="badge badge--${p.badge === 'Limited' ? 'gold' : p.badge === 'New' ? 'green' : 'primary'}">${esc(p.badge)}</span>`);
    if (p.oldPrice && p.stock !== 0) out.push(`<span class="badge badge--sale">−${discountPct(p)}%</span>`);
    return out.length ? `<div class="badges">${out.join('')}</div>` : '';
  }

  function productCard(p) {
    const wished = isWished(p.id);
    const cat = category(p.category);
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    return `
      <article class="card">
        <a class="card__media" href="${url}" tabindex="-1" aria-hidden="true">${productArt(p)}</a>
        ${badges(p)}
        <button class="card__wish${wished ? ' is-active' : ''}" type="button" data-wish="${p.id}" aria-pressed="${wished}" aria-label="${wished ? 'Remove from' : 'Add to'} wishlist: ${esc(p.name)}">${icon('heart')}</button>
        <div class="card__body">
          <p class="card__cat">${esc(cat ? cat.name : '')} · ${esc(p.sub)}</p>
          <h3 class="card__title"><a href="${url}">${esc(p.name)}</a></h3>
          ${stars(p.rating, p.reviews)}
          <div class="card__foot">
            ${priceHtml(p)}
            <button class="card__add" type="button" data-add="${p.id}" ${p.stock === 0 ? 'disabled' : ''} aria-label="${p.stock === 0 ? 'Sold out' : 'Add to cart'}: ${esc(p.name)}">${icon('bag')}<span>${p.stock === 0 ? 'Sold out' : 'Add'}</span></button>
          </div>
        </div>
      </article>`;
  }

  function renderGrid(el, list) {
    if (!el) return;
    el.innerHTML = list.map(productCard).join('');
  }

  // ---------- Wishlist ----------
  const getWishlist = () => storage.get(KEYS.wish, []).filter((id) => byId(id));
  const isWished = (id) => getWishlist().includes(id);
  function toggleWish(id) {
    const list = getWishlist();
    const i = list.indexOf(id);
    const added = i === -1;
    if (added) list.push(id); else list.splice(i, 1);
    storage.set(KEYS.wish, list);
    emit('wishlist:change', { id, added });
    const p = byId(id);
    toast(added ? `Saved “${p.name}” to your wishlist` : 'Removed from wishlist', { type: added ? 'success' : 'info' });
    return added;
  }

  // ---------- Cart ----------
  const getCart = () => storage.get(KEYS.cart, []).filter((i) => byId(i.id) && i.qty > 0);
  function saveCart(cart) {
    storage.set(KEYS.cart, cart);
    emit('cart:change');
  }
  const qtyInCart = (id, cart = getCart()) => cart.filter((i) => i.id === id).reduce((n, i) => n + i.qty, 0);
  const cartCount = () => getCart().reduce((n, i) => n + i.qty, 0);

  function addToCart(id, qty = 1, options = {}) {
    const p = byId(id);
    if (!p || p.stock === 0) return false;
    const color = options.color || (p.colors ? p.colors[0].name : '');
    const size = options.size || (p.sizes ? p.sizes[0] : '');
    const key = [id, color, size].join('|');
    const cart = getCart();
    const room = p.stock - qtyInCart(id, cart);
    if (room <= 0) {
      toast(`Sorry, only ${p.stock} of “${p.name}” available`, { type: 'error' });
      return false;
    }
    const add = Math.min(qty, room);
    const line = cart.find((i) => i.key === key);
    if (line) line.qty += add; else cart.push({ key, id, qty: add, color, size });
    saveCart(cart);
    bumpCart();
    toast(`${add > 1 ? add + ' × ' : ''}“${p.name}” added to cart`, {
      type: 'success',
      action: { label: 'View cart', run: () => openDrawer('cart') }
    });
    return true;
  }

  function setLineQty(key, qty) {
    const cart = getCart();
    const line = cart.find((i) => i.key === key);
    if (!line) return;
    const p = byId(line.id);
    const others = qtyInCart(line.id, cart) - line.qty;
    const max = Math.max(1, p.stock - others);
    if (qty > max) toast(`Only ${p.stock} available`, { type: 'error' });
    line.qty = Math.max(1, Math.min(qty, max));
    saveCart(cart);
  }

  function removeLine(key) {
    saveCart(getCart().filter((i) => i.key !== key));
  }

  function clearCart() {
    saveCart([]);
  }

  // ---------- Coupons & totals ----------
  function getCoupon() {
    const code = storage.get(KEYS.coupon, null);
    return code && S.coupons[code] ? code : null;
  }
  function couponLabel(code) {
    const c = S.coupons[code];
    if (!c) return '';
    return c.type === 'percent' ? `${c.value}% off` : `${money(c.value)} off`;
  }
  function applyCoupon(raw) {
    const code = String(raw || '').trim().toUpperCase();
    const c = S.coupons[code];
    if (!c) return { ok: false, message: 'That code is not valid.' };
    const subtotal = computeTotals().subtotal;
    if (c.minSubtotal && subtotal < c.minSubtotal) return { ok: false, message: `${code} needs a subtotal of ${money(c.minSubtotal)} or more.` };
    storage.set(KEYS.coupon, code);
    emit('cart:change');
    return { ok: true, message: `${code} applied — ${couponLabel(code)}.` };
  }
  function removeCoupon() {
    storage.remove(KEYS.coupon);
    emit('cart:change');
  }

  function computeTotals(method = 'standard', cart = getCart()) {
    const subtotal = round2(cart.reduce((s, i) => s + byId(i.id).price * i.qty, 0));
    const code = getCoupon();
    const c = code ? S.coupons[code] : null;
    let discount = 0;
    if (c && subtotal >= (c.minSubtotal || 0)) {
      discount = c.type === 'percent' ? (subtotal * c.value) / 100 : Math.min(c.value, subtotal);
    }
    discount = round2(discount);
    const net = subtotal - discount;
    const ship = S.shipping[method] || S.shipping.standard;
    let shipping = cart.length ? ship.price : 0;
    if (method === 'standard' && net >= S.freeShippingThreshold) shipping = 0;
    const tax = round2(net * S.taxRate);
    return {
      subtotal, discount, shipping, tax,
      total: round2(net + shipping + tax),
      coupon: c && discount > 0 ? code : null,
      count: cart.reduce((n, i) => n + i.qty, 0),
      toFreeShipping: Math.max(0, round2(S.freeShippingThreshold - net))
    };
  }

  function freeShippingBar(totals) {
    const pct = Math.min(100, ((S.freeShippingThreshold - totals.toFreeShipping) / S.freeShippingThreshold) * 100);
    const msg = totals.toFreeShipping > 0
      ? `You're <strong>${money(totals.toFreeShipping)}</strong> away from free shipping`
      : '🎉 You’ve unlocked <strong>free standard shipping</strong>';
    return `<div class="ship-progress"><p>${msg}</p><div class="ship-progress__bar"><span style="width:${pct}%"></span></div></div>`;
  }

  // ---------- Quantity stepper ----------
  function qtyStepper(value, attrs = {}) {
    const { key = '', max = 99, label = 'Quantity' } = attrs;
    const dataKey = key ? ` data-key="${esc(key)}"` : '';
    return `<div class="qty"${dataKey}>
      <button type="button" class="qty__btn" data-qty="-1" aria-label="Decrease quantity" ${value <= 1 ? 'disabled' : ''}>${icon('minus')}</button>
      <input class="qty__input" type="number" inputmode="numeric" min="1" max="${max}" value="${value}" aria-label="${esc(label)}">
      <button type="button" class="qty__btn" data-qty="1" aria-label="Increase quantity" ${value >= max ? 'disabled' : ''}>${icon('plus')}</button>
    </div>`;
  }

  // Line-item steppers (with data-key) update the cart wherever they appear.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.qty[data-key] .qty__btn');
    if (!btn) return;
    const wrap = btn.closest('.qty');
    const line = getCart().find((i) => i.key === wrap.dataset.key);
    if (line) setLineQty(line.key, line.qty + Number(btn.dataset.qty));
  });
  document.addEventListener('change', (e) => {
    const input = e.target.closest('.qty[data-key] .qty__input');
    if (!input) return;
    const n = parseInt(input.value, 10);
    setLineQty(input.closest('.qty').dataset.key, Number.isFinite(n) ? n : 1);
  });

  function lineItemHtml(line, variant = 'mini') {
    const p = byId(line.id);
    const opts = [line.color, line.size && `Size ${line.size}`].filter(Boolean).join(' · ');
    const url = `product.html?id=${encodeURIComponent(p.id)}`;
    const others = qtyInCart(p.id) - line.qty;
    return `
      <li class="line line--${variant}">
        <a class="line__media" href="${url}" tabindex="-1" aria-hidden="true">${productArt(p)}</a>
        <div class="line__info">
          <a class="line__name" href="${url}">${esc(p.name)}</a>
          ${opts ? `<p class="line__opts">${esc(opts)}</p>` : ''}
          <p class="line__unit">${money(p.price)}${variant === 'full' && p.oldPrice ? ` <s>${money(p.oldPrice)}</s>` : ''}</p>
          <div class="line__controls">
            ${qtyStepper(line.qty, { key: line.key, max: Math.max(1, p.stock - others), label: `Quantity for ${p.name}` })}
            <button type="button" class="line__remove" data-remove="${esc(line.key)}" aria-label="Remove ${esc(p.name)}">${icon('trash')}<span>Remove</span></button>
          </div>
        </div>
        <p class="line__total">${money(p.price * line.qty)}</p>
      </li>`;
  }

  // ---------- Toasts ----------
  function toast(message, opts = {}) {
    const region = $('#toasts');
    if (!region) return;
    const el = document.createElement('div');
    el.className = `toast toast--${opts.type || 'info'}`;
    el.setAttribute('role', opts.type === 'error' ? 'alert' : 'status');
    el.innerHTML = `<span class="toast__msg"></span>`;
    $('.toast__msg', el).textContent = message;
    if (opts.action) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'toast__action';
      b.textContent = opts.action.label;
      b.addEventListener('click', () => { opts.action.run(); dismiss(); });
      el.appendChild(b);
    }
    region.appendChild(el);
    while (region.children.length > 3) region.firstElementChild.remove();
    requestAnimationFrame(() => el.classList.add('is-in'));
    const timer = setTimeout(dismiss, opts.duration || 3500);
    function dismiss() {
      clearTimeout(timer);
      el.classList.remove('is-in');
      setTimeout(() => el.remove(), 300);
    }
  }

  function bumpCart() {
    $$('[data-cart-count]').forEach((el) => {
      el.classList.remove('is-bump');
      void el.offsetWidth;
      el.classList.add('is-bump');
    });
  }

  // ---------- Drawers ----------
  let lastFocus = null;
  function openDrawer(name) {
    const drawer = $(`#drawer-${name}`);
    if (!drawer) return;
    closeDrawers(true);
    lastFocus = document.activeElement;
    if (name === 'cart') renderMiniCart();
    drawer.classList.add('is-open');
    drawer.removeAttribute('inert');
    drawer.setAttribute('aria-hidden', 'false');
    $('#overlay').classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
    $$(`[data-open="${name}"]`).forEach((b) => b.setAttribute('aria-expanded', 'true'));
    const focusable = $('.drawer__close', drawer);
    if (focusable) focusable.focus();
  }
  function closeDrawers(silent) {
    $$('.drawer.is-open, .filters.is-open').forEach((d) => {
      d.classList.remove('is-open');
      if (d.classList.contains('drawer')) {
        d.setAttribute('inert', '');
        d.setAttribute('aria-hidden', 'true');
      }
    });
    $$('[data-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    const overlay = $('#overlay');
    if (overlay) overlay.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    if (!silent && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }
  function showOverlay() {
    $('#overlay').classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
  }

  function renderMiniCart() {
    const body = $('#mini-cart-body');
    const foot = $('#mini-cart-foot');
    if (!body) return;
    const cart = getCart();
    const t = computeTotals();
    $('#mini-cart-count').textContent = t.count ? `(${t.count})` : '';
    if (!cart.length) {
      body.innerHTML = `<div class="empty empty--small">
        <div class="empty__icon">${icon('bag')}</div>
        <p class="empty__title">Your cart is empty</p>
        <p>Find something lovely for yourself or a friend.</p>
        <a class="btn btn--primary" href="shop.html">Start shopping</a></div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = freeShippingBar(t) + `<ul class="lines">${cart.map((l) => lineItemHtml(l, 'mini')).join('')}</ul>`;
    foot.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><strong>${money(t.subtotal)}</strong></div>
      ${t.discount ? `<div class="summary-row summary-row--discount"><span>Discount (${esc(t.coupon)})</span><span>−${money(t.discount)}</span></div>` : ''}
      <p class="muted small">Shipping and taxes calculated at checkout.</p>
      <a class="btn btn--primary btn--block" href="checkout.html">Checkout · ${money(t.subtotal - t.discount)}</a>
      <a class="btn btn--ghost btn--block" href="cart.html">View full cart</a>`;
  }

  // ---------- Header & footer ----------
  function navLinks() {
    return [
      { href: 'index.html', label: 'Home', page: 'home' },
      { href: 'shop.html', label: 'Shop All', page: 'shop', cat: '' },
      ...CATEGORIES.map((c) => ({ href: `shop.html?cat=${c.id}`, label: c.name, page: 'shop', cat: c.id })),
      { href: 'contact.html', label: 'Contact', page: 'contact' }
    ];
  }

  function refreshNav() {
    const page = document.body.dataset.page;
    const cat = params().get('cat') || '';
    $$('[data-nav]').forEach((a) => {
      const active = a.dataset.page === page && (a.dataset.cat === undefined || a.dataset.cat === cat);
      a.classList.toggle('is-active', active);
      if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function renderHeader() {
    const mount = $('#site-header');
    if (!mount) return;
    const links = navLinks();
    const linkHtml = (l) => `<a href="${l.href}" data-nav data-page="${l.page}"${l.cat !== undefined ? ` data-cat="${l.cat}"` : ''}>${esc(l.label)}</a>`;
    const firstCoupon = Object.keys(S.coupons)[0];
    mount.innerHTML = `
      <a class="skip-link" href="#main">Skip to content</a>
      <div class="announce">
        <div class="container announce__inner">
          <span>${icon('truck')} Free shipping on orders over ${money(S.freeShippingThreshold)}</span>
          ${firstCoupon ? `<span class="announce__extra">${icon('tag')} Use code <strong>${firstCoupon}</strong> for ${couponLabel(firstCoupon)}</span>` : ''}
        </div>
      </div>
      <header class="header">
        <div class="container header__row">
          <button class="icon-btn header__menu" type="button" data-open="menu" aria-controls="drawer-menu" aria-expanded="false" aria-label="Open menu">${icon('menu')}</button>
          <a class="logo" href="index.html" aria-label="${esc(S.name)} home"><span class="logo__mark" aria-hidden="true">✿</span><span class="logo__text">${esc(S.name)}</span></a>
          <nav class="nav" aria-label="Main">${links.map(linkHtml).join('')}</nav>
          <div class="header__actions">
            <button class="icon-btn" type="button" data-toggle-search aria-controls="search-bar" aria-expanded="false" aria-label="Search">${icon('search')}</button>
            <a class="icon-btn" href="wishlist.html" aria-label="Wishlist">${icon('heart')}<span class="count" data-wish-count hidden>0</span></a>
            <button class="icon-btn" type="button" data-open="cart" aria-controls="drawer-cart" aria-expanded="false" aria-label="Open cart">${icon('bag')}<span class="count" data-cart-count hidden>0</span></button>
          </div>
        </div>
        <form class="search-bar" id="search-bar" action="shop.html" method="get" role="search" hidden>
          <div class="container search-bar__inner">
            ${icon('search')}
            <input type="search" name="q" placeholder="Search bags, gifts, paint sets…" aria-label="Search products" autocomplete="off">
            <button class="btn btn--primary" type="submit">Search</button>
          </div>
        </form>
      </header>

      <div class="overlay" id="overlay"></div>

      <aside class="drawer drawer--left" id="drawer-menu" aria-label="Menu" aria-hidden="true" inert>
        <div class="drawer__head">
          <a class="logo" href="index.html"><span class="logo__mark" aria-hidden="true">✿</span><span class="logo__text">${esc(S.name)}</span></a>
          <button class="icon-btn drawer__close" type="button" data-close aria-label="Close menu">${icon('close')}</button>
        </div>
        <div class="drawer__body">
          <form class="drawer-search" action="shop.html" method="get" role="search">
            ${icon('search')}<input type="search" name="q" placeholder="Search products" aria-label="Search products">
          </form>
          <nav class="mobile-nav" aria-label="Mobile">
            ${links.map(linkHtml).join('')}
            <a href="wishlist.html" data-nav data-page="wishlist">Wishlist</a>
            <a href="cart.html" data-nav data-page="cart">Cart</a>
          </nav>
          <div class="drawer__cats">
            ${CATEGORIES.map((c) => `<a class="mini-cat" href="shop.html?cat=${c.id}" style="--a:${c.bg[0]};--b:${c.bg[1]}"><span aria-hidden="true">${c.emoji}</span>${esc(c.name)}</a>`).join('')}
          </div>
        </div>
        <div class="drawer__foot muted small">
          <p>${icon('phone')} ${esc(S.contact.phone)}</p>
          <p>${icon('mail')} ${esc(S.contact.email)}</p>
        </div>
      </aside>

      <aside class="drawer drawer--right" id="drawer-cart" aria-label="Shopping cart" aria-hidden="true" inert>
        <div class="drawer__head">
          <h2 class="drawer__title">Your cart <span id="mini-cart-count" class="muted"></span></h2>
          <button class="icon-btn drawer__close" type="button" data-close aria-label="Close cart">${icon('close')}</button>
        </div>
        <div class="drawer__body" id="mini-cart-body"></div>
        <div class="drawer__foot" id="mini-cart-foot"></div>
      </aside>

      <div class="toasts" id="toasts" aria-live="polite"></div>
      <button class="to-top" type="button" aria-label="Back to top">${icon('arrowUp')}</button>`;
    refreshNav();
  }

  function renderFooter() {
    const mount = $('#site-footer');
    if (!mount) return;
    const year = new Date().getFullYear();
    mount.innerHTML = `
      <footer class="footer">
        <div class="container footer__grid">
          <div class="footer__brand">
            <a class="logo logo--light" href="index.html"><span class="logo__mark" aria-hidden="true">✿</span><span class="logo__text">${esc(S.name)}</span></a>
            <p>${esc(S.tagline)}. Thoughtfully chosen, beautifully packed and delivered to your door.</p>
            <div class="social">
              <a href="${esc(S.social.instagram)}" aria-label="Instagram">${icon('instagram')}</a>
              <a href="${esc(S.social.facebook)}" aria-label="Facebook">${icon('facebook')}</a>
              <a href="mailto:${esc(S.contact.email)}" aria-label="Email us">${icon('mail')}</a>
            </div>
          </div>
          <div>
            <h3 class="footer__title">Shop</h3>
            <ul>
              ${CATEGORIES.map((c) => `<li><a href="shop.html?cat=${c.id}">${esc(c.name)}</a></li>`).join('')}
              <li><a href="shop.html?sale=1">Sale</a></li>
              <li><a href="shop.html?sort=newest">New arrivals</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer__title">Help</h3>
            <ul>
              <li><a href="contact.html">Contact us</a></li>
              <li><a href="contact.html#faq">Shipping &amp; returns</a></li>
              <li><a href="contact.html#faq">FAQ</a></li>
              <li><a href="wishlist.html">Wishlist</a></li>
              <li><a href="cart.html">Cart</a></li>
            </ul>
          </div>
          <div>
            <h3 class="footer__title">Get in touch</h3>
            <ul class="footer__contact">
              <li>${icon('pin')}<span>${esc(S.contact.address)}</span></li>
              <li>${icon('phone')}<a href="tel:${esc(S.contact.phone.replace(/[^+\d]/g, ''))}">${esc(S.contact.phone)}</a></li>
              <li>${icon('mail')}<a href="mailto:${esc(S.contact.email)}">${esc(S.contact.email)}</a></li>
              <li>${icon('clock')}<span>${esc(S.contact.hours)}</span></li>
            </ul>
          </div>
        </div>
        <div class="container footer__bottom">
          <p>© ${year} ${esc(S.name)}. All rights reserved.</p>
          <p class="footer__pay" aria-label="Payment options">Cash on delivery · Cards · Mobile wallets</p>
        </div>
      </footer>`;
  }

  function updateCounts() {
    const c = cartCount();
    const w = getWishlist().length;
    $$('[data-cart-count]').forEach((el) => { el.textContent = c > 99 ? '99+' : c; el.hidden = !c; });
    $$('[data-wish-count]').forEach((el) => { el.textContent = w; el.hidden = !w; });
    const cartBtn = $('[data-open="cart"]');
    if (cartBtn) cartBtn.setAttribute('aria-label', `Open cart, ${c} item${c === 1 ? '' : 's'}`);
  }

  function syncWishButtons() {
    const list = getWishlist();
    $$('[data-wish]').forEach((b) => {
      const on = list.includes(b.dataset.wish);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
      const p = byId(b.dataset.wish);
      if (p && b.classList.contains('card__wish')) b.setAttribute('aria-label', `${on ? 'Remove from' : 'Add to'} wishlist: ${p.name}`);
    });
  }

  // ---------- Global events ----------
  function bindGlobal() {
    document.addEventListener('click', (e) => {
      const t = e.target;
      const add = t.closest('[data-add]');
      if (add) { e.preventDefault(); addToCart(add.dataset.add, 1); return; }
      const wish = t.closest('[data-wish]');
      if (wish) { e.preventDefault(); toggleWish(wish.dataset.wish); return; }
      const remove = t.closest('[data-remove]');
      if (remove) { removeLine(remove.dataset.remove); return; }
      const open = t.closest('[data-open]');
      if (open) { openDrawer(open.dataset.open); return; }
      if (t.closest('[data-close]') || t.id === 'overlay') { closeDrawers(); return; }
      const searchBtn = t.closest('[data-toggle-search]');
      if (searchBtn) {
        const bar = $('#search-bar');
        bar.hidden = !bar.hidden;
        searchBtn.setAttribute('aria-expanded', String(!bar.hidden));
        if (!bar.hidden) $('input', bar).focus();
        return;
      }
      if (t.closest('.to-top')) window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const bar = $('#search-bar');
      if (bar && !bar.hidden) {
        bar.hidden = true;
        $('[data-toggle-search]').setAttribute('aria-expanded', 'false');
      }
      closeDrawers();
    });

    // Keep focus inside an open drawer.
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab') return;
      const drawer = $('.drawer.is-open');
      if (!drawer) return;
      const items = $$('a[href], button:not([disabled]), input, select, textarea', drawer).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    document.addEventListener('cart:change', () => {
      updateCounts();
      if ($('#drawer-cart.is-open')) renderMiniCart();
    });
    document.addEventListener('wishlist:change', () => { updateCounts(); syncWishButtons(); });

    // Other tabs changing storage
    window.addEventListener('storage', (e) => {
      if (e.key === KEYS.cart || e.key === KEYS.coupon) emit('cart:change');
      if (e.key === KEYS.wish) emit('wishlist:change', {});
    });

    const toTop = $('.to-top');
    const header = $('.header');
    const onScroll = () => {
      if (toTop) toTop.classList.toggle('is-visible', window.scrollY > 600);
      if (header) header.classList.toggle('is-scrolled', window.scrollY > 10);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Close mobile drawer when resizing up to desktop.
    const mq = window.matchMedia('(min-width: 1024px)');
    const onMq = () => { if (mq.matches && $('#drawer-menu.is-open, .filters.is-open')) closeDrawers(true); };
    if (mq.addEventListener) mq.addEventListener('change', onMq);
  }

  // Reveal-on-scroll for elements marked data-reveal
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      els.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -40px 0px' });
    els.forEach((el) => io.observe(el));
  }

  // Inline form-field validation helper used by checkout / contact / newsletter.
  function validateForm(form) {
    let firstBad = null;
    $$('input, select, textarea', form).forEach((field) => {
      if (!field.name || field.type === 'radio') return;
      const wrap = field.closest('.field');
      if (!wrap) return;
      let err = $('.field__error', wrap);
      const ok = field.checkValidity();
      wrap.classList.toggle('is-invalid', !ok);
      field.setAttribute('aria-invalid', String(!ok));
      if (!ok) {
        if (!err) {
          err = document.createElement('p');
          err.className = 'field__error';
          err.id = `${field.id || field.name}-error`;
          wrap.appendChild(err);
          field.setAttribute('aria-describedby', err.id);
        }
        err.textContent = field.dataset.error || field.validationMessage;
        firstBad = firstBad || field;
      } else if (err) {
        err.textContent = '';
      }
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  function init() {
    renderHeader();
    renderFooter();
    bindGlobal();
    updateCounts();
    initReveal();
    document.documentElement.classList.add('js-ready');
  }

  window.App = {
    S, PRODUCTS, CATEGORIES, KEYS,
    money, esc, $, $$, icon, params, storage, emit,
    byId, category, productArt, productCard, renderGrid, stars, priceHtml, badges, discountPct,
    getWishlist, isWished, toggleWish,
    getCart, addToCart, setLineQty, removeLine, clearCart, qtyInCart, cartCount,
    getCoupon, couponLabel, applyCoupon, removeCoupon, computeTotals, freeShippingBar,
    qtyStepper, lineItemHtml, toast, openDrawer, closeDrawers, showOverlay, refreshNav, validateForm, initReveal
  };

  // Scripts are loaded at the end of <body>, so the mount points already exist.
  init();
})();

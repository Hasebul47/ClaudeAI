(function () {
  'use strict';
  const A = window.App;
  const { PRODUCTS, $, $$, esc, icon, money, params, byId, category, productArt, stars, priceHtml, badges, discountPct, renderGrid, qtyStepper, addToCart, qtyInCart, isWished } = A;

  const mount = $('#pdp');
  const p = byId(params().get('id'));

  if (!p) {
    mount.innerHTML = `<div class="empty" style="margin:24px 0 64px">
      <div class="empty__icon">${icon('search')}</div>
      <p class="empty__title">Product not found</p>
      <p>This item may have sold out or moved. Have a look at our latest collection instead.</p>
      <a class="btn btn--primary" href="shop.html">Browse the shop</a></div>`;
    return;
  }

  const cat = category(p.category);
  document.title = `${p.name} — ${window.STORE.name}`;
  const meta = $('meta[name="description"]');
  if (meta) meta.setAttribute('content', p.description);

  const views = [
    { angle: 135, scale: 1 },
    { angle: 45, scale: 0.8 },
    { angle: 220, scale: 1.25 },
    { angle: 310, scale: 0.95 }
  ];
  const state = { color: p.colors ? p.colors[0].name : '', size: p.sizes ? p.sizes[0] : '', qty: 1, view: 0 };

  const room = () => Math.max(0, p.stock - qtyInCart(p.id));

  function stockHtml() {
    if (p.stock === 0) return '<p class="stock stock--out">Sold out</p>';
    if (p.stock <= 5) return `<p class="stock stock--low">Only ${p.stock} left — order soon</p>`;
    return '<p class="stock stock--in">In stock, ready to ship</p>';
  }

  function hash(s) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return h;
  }
  const pool = window.SAMPLE_REVIEWS;
  const start = hash(p.id) % pool.length;
  const reviews = [0, 1, 2].map((i) => pool[(start + i) % pool.length]);

  mount.innerHTML = `
    <nav class="crumbs" aria-label="Breadcrumb">
      <a href="index.html">Home</a>${icon('chevronRight')}
      <a href="shop.html">Shop</a>${icon('chevronRight')}
      <a href="shop.html?cat=${cat.id}">${esc(cat.name)}</a>${icon('chevronRight')}
      <span aria-current="page">${esc(p.name)}</span>
    </nav>

    <div class="pdp">
      <div class="gallery">
        <div class="gallery__main" id="gallery-main">${productArt(p, views[0])}${badges(p)}</div>
        ${p.image ? '' : `<div class="gallery__thumbs" role="group" aria-label="Product views">
          ${views.map((v, i) => `<button class="thumb" type="button" data-view="${i}" aria-pressed="${i === 0}" aria-label="View ${i + 1}">${productArt(p, v)}</button>`).join('')}
        </div>`}
      </div>

      <div class="pdp__info">
        <p class="pdp__cat">${esc(cat.name)} · ${esc(p.sub)}</p>
        <h1>${esc(p.name)}</h1>
        <div class="pdp__meta">
          ${stars(p.rating, p.reviews)}
          <a class="small" href="#tab-reviews" data-goto-reviews>Read reviews</a>
        </div>
        <div class="pdp__price">
          ${priceHtml(p, 'price--lg')}
          ${p.oldPrice ? `<span class="save">Save ${money(p.oldPrice - p.price)} (${discountPct(p)}%)</span>` : ''}
        </div>
        <p class="pdp__desc">${esc(p.description)}</p>

        ${p.colors ? `<div class="option">
          <span class="option__label" id="color-label">Colour: <span id="color-name">${esc(state.color)}</span></span>
          <div class="swatches" role="radiogroup" aria-labelledby="color-label">
            ${p.colors.map((c, i) => `<button class="swatch" type="button" role="radio" aria-checked="${i === 0}" aria-label="${esc(c.name)}" title="${esc(c.name)}" data-color="${esc(c.name)}" style="--c:${c.hex}"></button>`).join('')}
          </div>
        </div>` : ''}

        ${p.sizes ? `<div class="option">
          <span class="option__label" id="size-label">Size: <span id="size-name">${esc(state.size)}</span></span>
          <div class="sizes" role="radiogroup" aria-labelledby="size-label">
            ${p.sizes.map((s, i) => `<button class="size" type="button" role="radio" aria-checked="${i === 0}" data-size="${esc(s)}">${esc(s)}</button>`).join('')}
          </div>
        </div>` : ''}

        ${stockHtml()}

        <div class="buy" id="buy"></div>
        <button class="btn btn--outline btn--block buy-now" type="button" id="buy-now" ${p.stock === 0 ? 'disabled' : ''}>Buy it now</button>

        <ul class="assurances">
          <li>${icon('truck')}<span>Free standard delivery on orders over ${money(window.STORE.freeShippingThreshold)}</span></li>
          <li>${icon('returns')}<span>7-day easy returns &amp; exchanges</span></li>
          <li>${icon('gift')}<span>Gift wrapping available at checkout</span></li>
          <li>${icon('shield')}<span>Secure checkout</span></li>
        </ul>
      </div>
    </div>

    <section class="ptabs" aria-label="Product information">
      <div class="ptabs__list" role="tablist">
        <button class="ptab" role="tab" type="button" id="tab-desc" aria-controls="panel-desc" aria-selected="true">Description</button>
        <button class="ptab" role="tab" type="button" id="tab-details" aria-controls="panel-details" aria-selected="false" tabindex="-1">Details</button>
        <button class="ptab" role="tab" type="button" id="tab-reviews" aria-controls="panel-reviews" aria-selected="false" tabindex="-1">Reviews (${p.reviews})</button>
        <button class="ptab" role="tab" type="button" id="tab-ship" aria-controls="panel-ship" aria-selected="false" tabindex="-1">Shipping</button>
      </div>
      <div class="ptabs__panel" role="tabpanel" id="panel-desc" aria-labelledby="tab-desc">
        <p>${esc(p.description)}</p>
        <ul class="ticks">${p.features.map((f) => `<li>${icon('check')}<span>${esc(f)}</span></li>`).join('')}</ul>
      </div>
      <div class="ptabs__panel" role="tabpanel" id="panel-details" aria-labelledby="tab-details" hidden>
        <table class="specs">
          <tr><th scope="row">Category</th><td>${esc(cat.name)}</td></tr>
          <tr><th scope="row">Type</th><td>${esc(p.sub)}</td></tr>
          ${p.colors ? `<tr><th scope="row">Colours</th><td>${p.colors.map((c) => esc(c.name)).join(', ')}</td></tr>` : ''}
          ${p.sizes ? `<tr><th scope="row">Sizes</th><td>${p.sizes.map(esc).join(', ')}</td></tr>` : ''}
          <tr><th scope="row">Availability</th><td>${p.stock === 0 ? 'Sold out' : `${p.stock} in stock`}</td></tr>
          <tr><th scope="row">SKU</th><td>BH-${String(hash(p.id) % 100000).padStart(5, '0')}</td></tr>
        </table>
      </div>
      <div class="ptabs__panel" role="tabpanel" id="panel-reviews" aria-labelledby="tab-reviews" hidden>
        <div class="review-summary">
          <strong>${p.rating.toFixed(1)}</strong>
          <div>${stars(p.rating)}<p class="muted small" style="margin:4px 0 0">Based on ${p.reviews} reviews</p></div>
        </div>
        <div class="reviews">
          ${reviews.map((r) => `<article class="review">
            <header>${stars(r.rating)}<span class="verified">${icon('check')} Verified buyer</span></header>
            <h4>${esc(r.title)}</h4>
            <p>${esc(r.text)}</p>
            <p class="muted small" style="margin-top:8px">— ${esc(r.name)}</p>
          </article>`).join('')}
        </div>
      </div>
      <div class="ptabs__panel" role="tabpanel" id="panel-ship" aria-labelledby="tab-ship" hidden>
        <ul class="ticks">
          <li>${icon('check')}<span><b>${esc(window.STORE.shipping.standard.label)}</b> (${esc(window.STORE.shipping.standard.eta)}) — ${money(window.STORE.shipping.standard.price)}, free over ${money(window.STORE.freeShippingThreshold)}</span></li>
          <li>${icon('check')}<span><b>${esc(window.STORE.shipping.express.label)}</b> (${esc(window.STORE.shipping.express.eta)}) — ${money(window.STORE.shipping.express.price)}</span></li>
          <li>${icon('check')}<span>Returns accepted within 7 days of delivery in original condition.</span></li>
        </ul>
      </div>
    </section>`;

  // ---------- Buy box ----------
  function renderBuy() {
    const max = room();
    state.qty = Math.max(1, Math.min(state.qty, max || 1));
    const soldOut = p.stock === 0;
    const maxed = !soldOut && max === 0;
    const wished = isWished(p.id);
    $('#buy').innerHTML = `
      ${qtyStepper(state.qty, { max: Math.max(1, max), label: 'Quantity' })}
      <button class="btn btn--primary" type="button" id="add" ${soldOut || maxed ? 'disabled' : ''}>${icon('bag')} ${soldOut ? 'Sold out' : maxed ? 'All stock in your cart' : 'Add to cart'}</button>
      <button class="buy__wish${wished ? ' is-active' : ''}" type="button" data-wish="${p.id}" aria-pressed="${wished}" aria-label="Save to wishlist">${icon('heart')}</button>`;
    if (soldOut || maxed) $$('#buy .qty button, #buy .qty input').forEach((el) => { el.disabled = true; });
  }
  renderBuy();

  $('#buy').addEventListener('click', (e) => {
    const step = e.target.closest('.qty__btn');
    if (step) {
      state.qty += Number(step.dataset.qty);
      renderBuy();
      return;
    }
    if (e.target.closest('#add')) addToCart(p.id, state.qty, { color: state.color, size: state.size });
  });
  $('#buy').addEventListener('change', (e) => {
    if (!e.target.classList.contains('qty__input')) return;
    const n = parseInt(e.target.value, 10);
    state.qty = Number.isFinite(n) ? n : 1;
    renderBuy();
  });
  document.addEventListener('cart:change', renderBuy);

  $('#buy-now').addEventListener('click', () => {
    if (room() === 0 || addToCart(p.id, state.qty, { color: state.color, size: state.size })) location.href = 'checkout.html';
  });

  // ---------- Options ----------
  function pick(attr, value, group) {
    $$(`[data-${attr}]`).forEach((b) => b.setAttribute('aria-checked', String(b.dataset[attr] === value)));
    state[attr] = value;
    $(`#${attr}-name`).textContent = value;
    if (group) $(`[data-${attr}="${CSS.escape(value)}"]`).focus();
  }
  mount.addEventListener('click', (e) => {
    const sw = e.target.closest('[data-color]');
    if (sw) pick('color', sw.dataset.color);
    const sz = e.target.closest('[data-size]');
    if (sz) pick('size', sz.dataset.size);
    const th = e.target.closest('[data-view]');
    if (th) {
      state.view = Number(th.dataset.view);
      $$('[data-view]').forEach((b) => b.setAttribute('aria-pressed', String(b === th)));
      $('#gallery-main').innerHTML = productArt(p, views[state.view]) + badges(p);
    }
    if (e.target.closest('[data-goto-reviews]')) {
      e.preventDefault();
      selectTab($('#tab-reviews'));
      $('.ptabs').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  // Arrow keys move between radio options
  mount.addEventListener('keydown', (e) => {
    const btn = e.target.closest('[role="radio"]');
    if (!btn || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
    e.preventDefault();
    const attr = btn.dataset.color !== undefined ? 'color' : 'size';
    const items = $$(`[data-${attr}]`);
    const i = items.indexOf(btn) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1);
    const next = items[(i + items.length) % items.length];
    pick(attr, next.dataset[attr], true);
  });

  // ---------- Tabs ----------
  const tabs = $$('.ptab');
  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $(`#${t.getAttribute('aria-controls')}`).hidden = !on;
    });
  }
  tabs.forEach((t) => t.addEventListener('click', () => selectTab(t)));
  $('.ptabs__list').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const i = tabs.indexOf(document.activeElement);
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });

  // ---------- Related ----------
  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
    .sort((a, b) => (b.sub === p.sub) - (a.sub === p.sub) || b.rating - a.rating)
    .slice(0, 4);
  if (related.length) {
    $('#related-wrap').hidden = false;
    renderGrid($('#related'), related);
  }
})();

(function () {
  'use strict';
  const { S, $, $$, esc, icon, money, byId, getCart, computeTotals, productArt, getCoupon, couponLabel, clearCart, removeCoupon, storage, KEYS, validateForm } = window.App;
  const root = $('#checkout-root');
  let method = 'standard';

  const crumbs = (current) => `
    <section class="page-head">
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span aria-hidden="true">›</span><a href="cart.html">Cart</a><span aria-hidden="true">›</span><span aria-current="page">${current}</span></nav>
    </section>`;

  function summaryHtml() {
    const cart = getCart();
    const t = computeTotals(method);
    const code = getCoupon();
    return `
      <h2 id="summary-title">Order summary</h2>
      <ul class="summary-items">
        ${cart.map((l) => {
          const p = byId(l.id);
          const opts = [l.color, l.size && `Size ${l.size}`].filter(Boolean).join(' · ');
          return `<li class="summary-item">
            <div class="summary-item__media">${productArt(p)}<span class="summary-item__qty" aria-label="Quantity ${l.qty}">${l.qty}</span></div>
            <div><b>${esc(p.name)}</b>${opts ? `<small>${esc(opts)}</small>` : ''}</div>
            <span>${money(p.price * l.qty)}</span>
          </li>`;
        }).join('')}
      </ul>
      <div class="summary-row"><span>Subtotal</span><span>${money(t.subtotal)}</span></div>
      ${t.discount ? `<div class="summary-row summary-row--discount"><span>Discount (${esc(code)} · ${esc(couponLabel(code))})</span><span>−${money(t.discount)}</span></div>` : ''}
      <div class="summary-row"><span>Shipping</span><span>${t.shipping === 0 ? 'Free' : money(t.shipping)}</span></div>
      <div class="summary-row"><span>Tax</span><span>${money(t.tax)}</span></div>
      <div class="summary-row summary-row--total"><span>Total</span><span>${money(t.total)}</span></div>
      ${!code ? '<p class="muted small" style="margin:10px 0 0">Have a discount code? <a href="cart.html" style="color:var(--primary);font-weight:600">Add it in your cart</a>.</p>' : ''}`;
  }

  function shippingChoices() {
    const t = computeTotals('standard');
    return Object.entries(S.shipping).map(([key, s]) => {
      const price = key === 'standard' && t.toFreeShipping === 0 ? 0 : s.price;
      return `<label class="choice">
        <input type="radio" name="shipping" value="${key}" ${key === method ? 'checked' : ''}>
        <span class="choice__body"><b>${esc(s.label)}</b><span>${esc(s.eta)}</span></span>
        <span class="choice__price">${price === 0 ? 'Free' : money(price)}</span>
      </label>`;
    }).join('');
  }

  function renderForm() {
    const cart = getCart();
    if (!cart.length) {
      root.innerHTML = crumbs('Checkout') + `<div class="empty" style="margin-bottom:64px">
        <div class="empty__icon">${icon('bag')}</div>
        <p class="empty__title">Nothing to check out yet</p>
        <p>Your cart is empty. Add a few favourites and come back here to place your order.</p>
        <a class="btn btn--primary" href="shop.html">Go to the shop</a></div>`;
      return;
    }
    root.innerHTML = crumbs('Checkout') + `
      <h1 class="sr-only">Checkout</h1>
      <div class="steps" aria-hidden="true">
        <span class="is-done"><b>1</b> Cart</span><span>›</span>
        <span class="is-current"><b>2</b> Details &amp; payment</span><span>›</span>
        <span><b>3</b> Confirmation</span>
      </div>
      <form class="checkout" id="checkout-form" novalidate>
        <div>
          <section class="panel form-section" aria-labelledby="h-contact">
            <h2 id="h-contact"><span class="num">1</span> Contact</h2>
            <div class="form-row">
              <div class="field"><label for="first">First name</label><input id="first" name="first" autocomplete="given-name" required data-error="Please enter your first name."></div>
              <div class="field"><label for="last">Last name</label><input id="last" name="last" autocomplete="family-name" required data-error="Please enter your last name."></div>
            </div>
            <div class="form-row">
              <div class="field"><label for="email">Email</label><input id="email" name="email" type="email" autocomplete="email" required data-error="Please enter a valid email address."></div>
              <div class="field"><label for="phone">Phone</label><input id="phone" name="phone" type="tel" autocomplete="tel" required pattern="[\\d\\s\\(\\)\\+\\-]{7,20}" data-error="Please enter a valid phone number."></div>
            </div>
          </section>

          <section class="panel form-section" aria-labelledby="h-ship">
            <h2 id="h-ship"><span class="num">2</span> Delivery address</h2>
            <div class="field"><label for="address">Street address</label><input id="address" name="address" autocomplete="address-line1" required data-error="Please enter your street address."></div>
            <div class="field"><label for="address2">Apartment, suite, etc. <span class="opt">(optional)</span></label><input id="address2" name="address2" autocomplete="address-line2"></div>
            <div class="form-row form-row--3">
              <div class="field"><label for="city">City</label><input id="city" name="city" autocomplete="address-level2" required data-error="Please enter your city."></div>
              <div class="field"><label for="postcode">Postcode</label><input id="postcode" name="postcode" autocomplete="postal-code" required data-error="Required."></div>
              <div class="field"><label for="country">Country</label><input id="country" name="country" autocomplete="country-name" required data-error="Required."></div>
            </div>
            <span class="label" style="display:block;font-weight:600;font-size:.88rem;margin:6px 0 10px">Delivery method</span>
            <div id="shipping-choices" role="radiogroup" aria-label="Delivery method">${shippingChoices()}</div>
          </section>

          <section class="panel form-section" aria-labelledby="h-pay">
            <h2 id="h-pay"><span class="num">3</span> Payment</h2>
            <div role="radiogroup" aria-label="Payment method">
              <label class="choice"><input type="radio" name="payment" value="Cash on delivery" checked><span class="choice__body"><b>Cash on delivery</b><span>Pay in cash when your order arrives</span></span></label>
              <label class="choice"><input type="radio" name="payment" value="Card"><span class="choice__body"><b>Credit / debit card</b><span>Pay securely through our payment partner</span></span></label>
              <label class="choice"><input type="radio" name="payment" value="Mobile wallet"><span class="choice__body"><b>Mobile wallet</b><span>Pay with your mobile banking app</span></span></label>
            </div>
            ${S.demoMode ? `<p class="notice">${icon('shield')}<span>Demo store: no payment is taken and no data leaves your browser. Connect a payment gateway before going live.</span></p>` : ''}
          </section>

          <section class="panel form-section" aria-labelledby="h-extra">
            <h2 id="h-extra"><span class="num">4</span> Extras</h2>
            <label class="check" style="margin-bottom:14px"><input type="checkbox" name="gift" id="gift"> Add free gift wrapping</label>
            <div class="field"><label for="notes">Order notes <span class="opt">(optional — e.g. name for personalised items, gift message)</span></label><textarea id="notes" name="notes" maxlength="500"></textarea></div>
          </section>
        </div>

        <aside class="panel panel--sticky" aria-labelledby="summary-title">
          <div id="summary">${summaryHtml()}</div>
          <button class="btn btn--primary btn--block" type="submit" style="margin-top:16px">Place order</button>
          <p class="secure-note">${icon('shield')} Your information is kept private</p>
        </aside>
      </form>`;

    const form = $('#checkout-form');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'shipping') {
        method = e.target.value;
        $('#summary').innerHTML = summaryHtml();
      }
      // Re-check a field once it has been flagged invalid
      const wrap = e.target.closest('.field.is-invalid');
      if (wrap && e.target.checkValidity()) {
        wrap.classList.remove('is-invalid');
        e.target.setAttribute('aria-invalid', 'false');
        const err = $('.field__error', wrap);
        if (err) err.textContent = '';
      }
    });
    form.addEventListener('submit', onSubmit);
  }

  function onSubmit(e) {
    e.preventDefault();
    const form = e.target;
    if (!validateForm(form)) return;
    const cart = getCart();
    if (!cart.length) return renderForm();
    const f = Object.fromEntries(new FormData(form).entries());
    const totals = computeTotals(method);
    const order = {
      number: `BH-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      date: new Date().toISOString(),
      items: cart.map((l) => ({ ...l, name: byId(l.id).name, price: byId(l.id).price })),
      totals,
      coupon: totals.coupon,
      shipping: { method, ...S.shipping[method] },
      payment: f.payment,
      gift: !!f.gift,
      notes: f.notes || '',
      customer: { name: `${f.first} ${f.last}`.trim(), email: f.email, phone: f.phone },
      address: [f.address, f.address2, `${f.city} ${f.postcode}`, f.country].filter((x) => x && x.trim()).join(', ')
    };
    const orders = storage.get(KEYS.orders, []);
    orders.unshift(order);
    storage.set(KEYS.orders, orders.slice(0, 20));
    renderSuccess(order);
    clearCart();
    removeCoupon();
  }

  function renderSuccess(o) {
    root.innerHTML = `
      <section class="success" aria-labelledby="success-title">
        <div class="steps" aria-hidden="true" style="justify-content:center">
          <span class="is-done"><b>1</b> Cart</span><span>›</span>
          <span class="is-done"><b>2</b> Details</span><span>›</span>
          <span class="is-current"><b>3</b> Confirmation</span>
        </div>
        <div class="success__icon">${icon('check')}</div>
        <h1 id="success-title" tabindex="-1">Thank you, ${esc(o.customer.name.split(' ')[0])}!</h1>
        <p class="muted">Your order <strong style="color:var(--ink)">${esc(o.number)}</strong> has been placed. A confirmation will be sent to ${esc(o.customer.email)}.</p>
        <div class="panel">
          <div class="order-meta">
            <div><b>Delivery to</b>${esc(o.address)}</div>
            <div><b>Delivery</b>${esc(o.shipping.label)} · ${esc(o.shipping.eta)}</div>
            <div><b>Payment</b>${esc(o.payment)}${o.gift ? ' · Gift wrapped' : ''}</div>
          </div>
          <ul class="summary-items" style="max-height:none">
            ${o.items.map((l) => {
              const p = byId(l.id);
              const opts = [l.color, l.size && `Size ${l.size}`].filter(Boolean).join(' · ');
              return `<li class="summary-item">
                <div class="summary-item__media">${productArt(p)}<span class="summary-item__qty">${l.qty}</span></div>
                <div><b>${esc(l.name)}</b>${opts ? `<small>${esc(opts)}</small>` : ''}</div>
                <span>${money(l.price * l.qty)}</span>
              </li>`;
            }).join('')}
          </ul>
          <div class="summary-row"><span>Subtotal</span><span>${money(o.totals.subtotal)}</span></div>
          ${o.totals.discount ? `<div class="summary-row summary-row--discount"><span>Discount (${esc(o.coupon)})</span><span>−${money(o.totals.discount)}</span></div>` : ''}
          <div class="summary-row"><span>Shipping</span><span>${o.totals.shipping === 0 ? 'Free' : money(o.totals.shipping)}</span></div>
          <div class="summary-row"><span>Tax</span><span>${money(o.totals.tax)}</span></div>
          <div class="summary-row summary-row--total"><span>Total</span><span>${money(o.totals.total)}</span></div>
        </div>
        <a class="btn btn--primary" href="shop.html">Continue shopping</a>
      </section>`;
    window.scrollTo({ top: 0 });
    $('#success-title').focus();
  }

  // Keep the summary in sync if the cart changes in another tab
  document.addEventListener('cart:change', () => {
    if (!$('#checkout-form')) return;
    if (!getCart().length) return renderForm();
    $('#summary').innerHTML = summaryHtml();
    $('#shipping-choices').innerHTML = shippingChoices();
  });

  renderForm();
})();

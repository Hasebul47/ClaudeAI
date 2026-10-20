(function () {
  'use strict';
  const { PRODUCTS, $, esc, icon, money, getCart, computeTotals, freeShippingBar, lineItemHtml, getCoupon, couponLabel, applyCoupon, removeCoupon, renderGrid, clearCart } = window.App;
  const root = $('#cart-root');
  let couponMsg = null;

  function summaryHtml(t) {
    const code = getCoupon();
    return `
      <aside class="panel panel--sticky" aria-labelledby="summary-title">
        <h2 id="summary-title">Order summary</h2>
        <div class="summary-row"><span>Subtotal (${t.count} item${t.count === 1 ? '' : 's'})</span><span>${money(t.subtotal)}</span></div>
        ${t.discount ? `<div class="summary-row summary-row--discount"><span>Discount</span><span>−${money(t.discount)}</span></div>` : ''}
        <div class="summary-row"><span>Shipping</span><span>${t.shipping === 0 ? 'Free' : money(t.shipping)}</span></div>
        <div class="summary-row"><span>Estimated tax</span><span>${money(t.tax)}</span></div>
        ${code ? `<div class="coupon-applied"><span>${icon('tag')} ${esc(code)} · ${esc(couponLabel(code))}${t.discount ? '' : ' (not yet eligible)'}</span><button type="button" id="coupon-remove">Remove</button></div>` : `
        <form class="coupon" id="coupon-form" novalidate>
          <label class="sr-only" for="coupon-input">Discount code</label>
          <input id="coupon-input" name="code" placeholder="Discount code" autocomplete="off">
          <button class="btn btn--dark btn--sm" type="submit">Apply</button>
        </form>`}
        ${couponMsg && !couponMsg.ok ? `<p class="coupon-msg is-bad" role="status">${esc(couponMsg.message)}</p>` : ''}
        <div class="summary-row summary-row--total"><span>Total</span><span>${money(t.total)}</span></div>
        <a class="btn btn--primary btn--block" href="checkout.html" style="margin-top:14px">Proceed to checkout</a>
        <p class="secure-note">${icon('shield')} Secure checkout</p>
      </aside>`;
  }

  function render() {
    const cart = getCart();
    const t = computeTotals();
    if (!cart.length) {
      root.innerHTML = `<div class="empty" style="margin-bottom:56px">
        <div class="empty__icon">${icon('bag')}</div>
        <p class="empty__title">Your cart is empty</p>
        <p>Looks like you haven’t added anything yet. Explore our collections to find something you’ll love.</p>
        <a class="btn btn--primary" href="shop.html">Start shopping</a></div>`;
    } else {
      root.innerHTML = `
        <div class="cart-layout">
          <section class="panel" aria-label="Cart items">
            ${freeShippingBar(t)}
            <ul class="lines">${cart.map((l) => lineItemHtml(l, 'full')).join('')}</ul>
            <div style="display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px;margin-top:12px">
              <a class="link-arrow" href="shop.html">Continue shopping ${icon('arrowRight')}</a>
              <button class="btn btn--ghost btn--sm" type="button" id="clear-cart">Clear cart</button>
            </div>
          </section>
          ${summaryHtml(t)}
        </div>`;
    }
    renderUpsell(cart);
  }

  function renderUpsell(cart) {
    const inCart = new Set(cart.map((i) => i.id));
    const cats = new Set(cart.map((i) => PRODUCTS.find((p) => p.id === i.id).category));
    const picks = PRODUCTS.filter((p) => !inCart.has(p.id) && p.stock > 0)
      .sort((a, b) => (cats.has(b.category) - cats.has(a.category)) || b.rating - a.rating)
      .slice(0, 4);
    $('#upsell-wrap').hidden = !picks.length;
    renderGrid($('#upsell'), picks);
  }

  root.addEventListener('submit', (e) => {
    if (e.target.id !== 'coupon-form') return;
    e.preventDefault();
    couponMsg = applyCoupon(e.target.code.value);
    render();
    if (!couponMsg.ok) {
      const input = $('#coupon-input');
      if (input) { input.value = e.target.code.value; input.focus(); }
    }
  });
  root.addEventListener('click', (e) => {
    if (e.target.closest('#coupon-remove')) { couponMsg = null; removeCoupon(); }
    if (e.target.closest('#clear-cart') && window.confirm('Remove all items from your cart?')) clearCart();
  });
  document.addEventListener('cart:change', render);
  render();
})();

(function () {
  'use strict';
  const { PRODUCTS, CATEGORIES, $, $$, esc, icon, money, renderGrid, productArt, stars, storage, KEYS, toast, validateForm, initReveal } = window.App;

  // Perks strip
  const perks = [
    ['truck', 'Free shipping', `On orders over ${money(window.STORE.freeShippingThreshold)}`],
    ['returns', 'Easy returns', '7-day hassle-free returns'],
    ['shield', 'Secure checkout', 'Your details stay safe'],
    ['gift', 'Gift wrapping', 'Free on special items']
  ];
  $('#perks').innerHTML = perks.map(([i, t, s]) =>
    `<li class="perk"><span class="perk__icon">${icon(i)}</span><div><strong>${t}</strong><span>${s}</span></div></li>`).join('');

  // Categories
  $('#home-categories').innerHTML = CATEGORIES.map((c) => {
    const n = PRODUCTS.filter((p) => p.category === c.id).length;
    return `<a class="cat-card" href="shop.html?cat=${c.id}" style="--a:${c.bg[0]};--b:${c.bg[1]}" data-reveal>
      <span class="cat-card__emoji" aria-hidden="true">${c.emoji}</span>
      <h3>${esc(c.title)}</h3>
      <p>${esc(c.blurb)}</p>
      <span class="pill">${n} products ${icon('arrowRight')}</span>
    </a>`;
  }).join('');

  // Featured tabs
  const collections = {
    featured: () => PRODUCTS.filter((p) => p.featured),
    new: () => [...PRODUCTS].sort((a, b) => b.added - a.added),
    best: () => [...PRODUCTS].sort((a, b) => b.reviews - a.reviews),
    sale: () => PRODUCTS.filter((p) => p.oldPrice)
  };
  const grid = $('#featured-grid');
  function showTab(name) {
    $$('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === name)));
    renderGrid(grid, collections[name]().slice(0, 8));
  }
  $$('[data-tab]').forEach((t) => t.addEventListener('click', () => showTab(t.dataset.tab)));
  // Arrow-key navigation between tabs
  $('.tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const tabs = $$('[data-tab]');
    const i = tabs.indexOf(document.activeElement);
    if (i === -1) return;
    const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    next.focus();
    showTab(next.dataset.tab);
  });
  showTab('featured');

  // Special items promo
  const special = PRODUCTS.filter((p) => p.category === 'special').sort((a, b) => b.reviews - a.reviews).slice(0, 4);
  $('#promo-items').innerHTML = special.map((p) => `
    <a class="promo-item" href="product.html?id=${p.id}">
      ${productArt(p)}
      <b>${esc(p.name)}</b>
      <small>${money(p.price)}</small>
    </a>`).join('');

  // Countdown to the end of this week (Sunday 23:59:59 local time)
  const end = new Date();
  end.setDate(end.getDate() + ((7 - end.getDay()) % 7));
  end.setHours(23, 59, 59, 0);
  const pad = (n) => String(n).padStart(2, '0');
  function tick() {
    const diff = Math.max(0, end - Date.now());
    const s = Math.floor(diff / 1000);
    $('[data-cd="d"]').textContent = pad(Math.floor(s / 86400));
    $('[data-cd="h"]').textContent = pad(Math.floor((s % 86400) / 3600));
    $('[data-cd="m"]').textContent = pad(Math.floor((s % 3600) / 60));
    $('[data-cd="s"]').textContent = pad(s % 60);
  }
  tick();
  setInterval(tick, 1000);

  // Hobby corner
  const hobby = PRODUCTS.filter((p) => p.category === 'hobby');
  const subs = [...new Set(hobby.map((p) => p.sub))];
  const subEmoji = Object.fromEntries(hobby.map((p) => [p.sub, p.emoji]));
  $('#hobby-chips').innerHTML = subs.map((s) =>
    `<a class="chip" href="shop.html?cat=hobby&sub=${encodeURIComponent(s)}"><span aria-hidden="true">${subEmoji[s]}</span>${esc(s)}</a>`).join('');
  renderGrid($('#hobby-grid'), [...hobby].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating).slice(0, 4));

  // Testimonials
  $('#quotes').innerHTML = window.TESTIMONIALS.map((t) => `
    <figure class="quote" data-reveal>
      ${stars(t.rating)}
      <blockquote>“${esc(t.text)}”</blockquote>
      <figcaption><span class="avatar" aria-hidden="true">${esc(t.name[0])}</span><div><b>${esc(t.name)}</b><span class="muted small">Bought: ${esc(t.item)}</span></div></figcaption>
    </figure>`).join('');

  // Newsletter
  const form = $('#newsletter-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateForm(form)) return;
    const email = form.email.value.trim().toLowerCase();
    const list = storage.get(KEYS.newsletter, []);
    if (!list.includes(email)) list.push(email);
    storage.set(KEYS.newsletter, list);
    form.reset();
    const code = Object.keys(window.STORE.coupons)[0];
    toast(code ? `Thanks for subscribing! Use code ${code} for ${window.App.couponLabel(code)}.` : 'Thanks for subscribing!', { type: 'success', duration: 5000 });
  });

  initReveal();
})();

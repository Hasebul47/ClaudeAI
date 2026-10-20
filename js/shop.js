(function () {
  'use strict';
  const { PRODUCTS, CATEGORIES, $, $$, esc, icon, money, category, renderGrid, refreshNav } = window.App;
  const PAGE = 12;

  const state = { cat: '', subs: new Set(), q: '', min: null, max: null, rating: 0, inStock: false, sale: false, sort: 'featured', limit: PAGE };

  const num = (v) => (v === '' || v == null || !Number.isFinite(Number(v)) ? null : Number(v));

  function readUrl() {
    const p = new URLSearchParams(location.search);
    state.cat = category(p.get('cat')) ? p.get('cat') : '';
    state.subs = new Set((p.get('sub') || '').split(',').map((s) => s.trim()).filter(Boolean));
    state.q = p.get('q') || '';
    state.min = num(p.get('min'));
    state.max = num(p.get('max'));
    state.rating = Number(p.get('rating')) || 0;
    state.inStock = p.get('stock') === '1';
    state.sale = p.get('sale') === '1';
    const sort = p.get('sort');
    state.sort = $(`#sort option[value="${CSS.escape(sort || '')}"]`) ? sort : 'featured';
  }

  function writeUrl() {
    const p = new URLSearchParams();
    if (state.cat) p.set('cat', state.cat);
    if (state.subs.size) p.set('sub', [...state.subs].join(','));
    if (state.q) p.set('q', state.q);
    if (state.min != null) p.set('min', state.min);
    if (state.max != null) p.set('max', state.max);
    if (state.rating) p.set('rating', state.rating);
    if (state.inStock) p.set('stock', '1');
    if (state.sale) p.set('sale', '1');
    if (state.sort !== 'featured') p.set('sort', state.sort);
    const qs = p.toString();
    history.replaceState(null, '', qs ? `?${qs}` : location.pathname);
    refreshNav();
  }

  function matches(p, ignore) {
    if (ignore !== 'cat' && state.cat && p.category !== state.cat) return false;
    if (ignore !== 'sub' && state.subs.size && !state.subs.has(p.sub)) return false;
    if (state.min != null && p.price < state.min) return false;
    if (state.max != null && p.price > state.max) return false;
    if (state.rating && p.rating < state.rating) return false;
    if (state.inStock && p.stock === 0) return false;
    if (state.sale && !p.oldPrice) return false;
    const terms = state.q.toLowerCase().split(/\s+/).filter(Boolean);
    if (terms.length) {
      const hay = [p.name, p.sub, p.description, category(p.category).name, ...(p.colors || []).map((c) => c.name)].join(' ').toLowerCase();
      if (!terms.every((t) => hay.includes(t))) return false;
    }
    return true;
  }

  const sorters = {
    featured: (a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.reviews - a.reviews,
    newest: (a, b) => b.added - a.added,
    popular: (a, b) => b.reviews - a.reviews,
    rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price
  };

  function results() {
    return PRODUCTS.filter((p) => matches(p)).sort(sorters[state.sort]);
  }

  // ---------- Filter options ----------
  function renderOptions() {
    const catCount = (id) => PRODUCTS.filter((p) => (!id || p.category === id) && matches(p, 'cat')).length;
    $('#f-cats').innerHTML = [{ id: '', name: 'All products' }, ...CATEGORIES].map((c) => `
      <label class="check"><input type="radio" name="cat" value="${c.id}" ${state.cat === c.id ? 'checked' : ''}> ${esc(c.name)} <small>${catCount(c.id)}</small></label>`).join('');

    const pool = PRODUCTS.filter((p) => !state.cat || p.category === state.cat);
    const subs = [...new Set(pool.map((p) => p.sub))].sort();
    // Drop selected subcategories that don't exist in the current category.
    state.subs.forEach((s) => { if (!subs.includes(s)) state.subs.delete(s); });
    $('#f-subs').innerHTML = subs.map((s) => {
      const n = pool.filter((p) => p.sub === s && matches(p, 'sub')).length;
      return `<label class="check"><input type="checkbox" name="sub" value="${esc(s)}" ${state.subs.has(s) ? 'checked' : ''}> ${esc(s)} <small>${n}</small></label>`;
    }).join('');
  }

  function syncControls() {
    $('#shop-search').value = state.q;
    $('#sort').value = state.sort;
    $('#f-min').value = state.min == null ? '' : state.min;
    $('#f-max').value = state.max == null ? '' : state.max;
    $$('input[name="rating"]').forEach((r) => { r.checked = Number(r.value) === state.rating; });
    $('#f-stock').checked = state.inStock;
    $('#f-sale').checked = state.sale;
  }

  // ---------- Header, chips, grid ----------
  function renderHead() {
    const c = category(state.cat);
    const title = state.q ? `Results for “${state.q}”` : c ? c.title : 'Shop all';
    $('#shop-title').textContent = title;
    $('#shop-desc').textContent = c ? c.blurb : 'Ladies’ essentials, special gifts and hobby supplies — all in one place.';
    document.title = `${c ? c.title : 'Shop'} — ${window.STORE.name}`;
    $('#crumbs').innerHTML = `<a href="index.html">Home</a>${icon('chevronRight')}` +
      (c ? `<a href="shop.html">Shop</a>${icon('chevronRight')}<span aria-current="page">${esc(c.name)}</span>` : '<span aria-current="page">Shop</span>');
  }

  function activeChips() {
    const chips = [];
    const c = category(state.cat);
    if (c) chips.push(['cat', c.name]);
    state.subs.forEach((s) => chips.push([`sub:${s}`, s]));
    if (state.q) chips.push(['q', `“${state.q}”`]);
    if (state.min != null || state.max != null) {
      chips.push(['price', state.min != null && state.max != null ? `${money(state.min)} – ${money(state.max)}` : state.min != null ? `From ${money(state.min)}` : `Up to ${money(state.max)}`]);
    }
    if (state.rating) chips.push(['rating', `${state.rating}★ & up`]);
    if (state.inStock) chips.push(['stock', 'In stock']);
    if (state.sale) chips.push(['sale', 'On sale']);
    $('#active-filters').innerHTML = chips.map(([k, label]) =>
      `<span class="chip">${esc(label)}<button type="button" data-unfilter="${esc(k)}" aria-label="Remove filter ${esc(label)}">${icon('close')}</button></span>`).join('') +
      (chips.length > 1 ? '<button type="button" class="chip" data-unfilter="all">Clear all</button>' : '');
    const n = chips.filter(([k]) => k !== 'q').length;
    $('#filter-count').textContent = n ? `(${n})` : '';
  }

  function render() {
    const list = results();
    const shown = list.slice(0, state.limit);
    renderHead();
    activeChips();
    $('#count').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    $('#f-apply').textContent = `Show ${list.length} result${list.length === 1 ? '' : 's'}`;
    const grid = $('#shop-grid');
    if (!list.length) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1">
        <div class="empty__icon">${icon('search')}</div>
        <p class="empty__title">No products found</p>
        <p>Try a different search term or remove a filter or two.</p>
        <button class="btn btn--primary" type="button" data-unfilter="all">Clear all filters</button></div>`;
    } else {
      renderGrid(grid, shown);
    }
    $('#load-more').innerHTML = list.length > shown.length
      ? `<p>Showing ${shown.length} of ${list.length}</p><button class="btn btn--outline" type="button" id="more">Load more</button>`
      : '';
  }

  function update(opts = {}) {
    if (!opts.keepLimit) state.limit = PAGE;
    if (opts.options) renderOptions();
    writeUrl();
    render();
  }

  // ---------- Events ----------
  $('#drawer-filters').addEventListener('change', (e) => {
    const t = e.target;
    if (t.name === 'cat') { state.cat = t.value; update({ options: true }); return; }
    if (t.name === 'sub') { if (t.checked) state.subs.add(t.value); else state.subs.delete(t.value); update({ options: true }); return; }
    if (t.name === 'rating') state.rating = Number(t.value);
    if (t.id === 'f-stock') state.inStock = t.checked;
    if (t.id === 'f-sale') state.sale = t.checked;
    if (t.id === 'f-min' || t.id === 'f-max') {
      state.min = num($('#f-min').value);
      state.max = num($('#f-max').value);
      if (state.min != null && state.max != null && state.min > state.max) [state.min, state.max] = [state.max, state.min];
      syncControls();
    }
    update({ options: true });
  });

  $('#f-clear').addEventListener('click', clearAll);
  function clearAll() {
    Object.assign(state, { cat: '', q: '', min: null, max: null, rating: 0, inStock: false, sale: false });
    state.subs.clear();
    syncControls();
    update({ options: true });
  }

  $('#sort').addEventListener('change', (e) => { state.sort = e.target.value; update(); });

  let t;
  $('#shop-search').addEventListener('input', (e) => {
    clearTimeout(t);
    t = setTimeout(() => { state.q = e.target.value.trim(); update({ options: true }); }, 250);
  });

  document.addEventListener('click', (e) => {
    const un = e.target.closest('[data-unfilter]');
    if (un) {
      const k = un.dataset.unfilter;
      if (k === 'all') return clearAll();
      if (k === 'cat') state.cat = '';
      else if (k.startsWith('sub:')) state.subs.delete(k.slice(4));
      else if (k === 'q') state.q = '';
      else if (k === 'price') { state.min = null; state.max = null; }
      else if (k === 'rating') state.rating = 0;
      else if (k === 'stock') state.inStock = false;
      else if (k === 'sale') state.sale = false;
      syncControls();
      update({ options: true });
      return;
    }
    if (e.target.closest('#more')) {
      state.limit += PAGE;
      update({ keepLimit: true });
    }
  });

  readUrl();
  renderOptions();
  syncControls();
  writeUrl();
  render();
})();

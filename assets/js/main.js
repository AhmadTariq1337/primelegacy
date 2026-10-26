(() => {
  'use strict';

  const { STORE, PRODUCTS, CATEGORIES, COLLECTIONS, CAT_PAGE, LOOKBOOK, ICONS } = window;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const page = document.body.dataset.page || 'home';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));
  const collectionBySlug = Object.fromEntries(COLLECTIONS.map(c => [c.slug, c]));

  const img = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const money = n => `${STORE.currency} ${n.toLocaleString('en-PK')}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const productUrl = id => `product.html?id=${encodeURIComponent(id)}`;
  const byRank = (a, b) => a.rank - b.rank;

  // Buy Now opens WhatsApp with the product pre-filled in the message.
  const WA_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 20.5l1.2-4.2A8.5 8.5 0 1 1 8 19.6z"/><path d="M9 8.6c0 3.4 2.9 6.3 6.3 6.3l1.1-1.4-2.1-1-.9.8c-1-.4-2.2-1.6-2.6-2.6l.8-.9-1-2.1z"/></svg>';
  const whatsappUrl = (p, size, qty = 1) => {
    const link = new URL(productUrl(p.id), location.href).href;
    const optLabel = p.cat === 'fragrance' ? 'Volume' : 'Size';
    const text = `Hello ${STORE.name}! I'd like to buy:\n\n${p.name}\nPrice: ${money(p.price)}\n${optLabel}: ${size || '(please confirm)'}\nQuantity: ${qty}\n\n${link}`;
    return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
  };

  const store = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage unavailable */ }
    }
  };

  /* ---------- Store contact details ---------- */
  $$('[data-contact-email]').forEach(a => { a.href = `mailto:${STORE.email}`; a.textContent = STORE.email; });
  $$('[data-contact-phone]').forEach(a => { a.href = `tel:+${STORE.whatsapp}`; a.textContent = STORE.phoneDisplay; });
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* ---------- Preloader (home, first visit per session) ---------- */
  if ($('.preloader')) {
    document.body.classList.add('is-loading');
    const finishLoading = () => {
      document.body.classList.add('is-loaded');
      document.body.classList.remove('is-loading');
    };
    if (reduceMotion) finishLoading();
    else window.addEventListener('load', () => setTimeout(finishLoading, 700));
    setTimeout(finishLoading, 3000); // never block the page on slow images
  }

  /* ---------- Scroll locking for overlays ---------- */
  const locks = new Set();
  const lock = key => { locks.add(key); document.body.classList.add('no-scroll'); };
  const unlock = key => { locks.delete(key); if (!locks.size) document.body.classList.remove('no-scroll'); };

  /* ---------- Shared page sections ---------- */
  const SERVICES = `
    <div class="service reveal">
      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 12h24v20H4zM28 18h9l7 7v7H28z"/><circle cx="12" cy="35" r="4"/><circle cx="36" cy="35" r="4"/></svg>
      <h3>Fast Shipping</h3>
      <p>Free delivery on orders above Rs. 5,000. No hidden charges — just effortless delivery to your door.</p>
    </div>
    <div class="service reveal">
      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 18a16 16 0 0 1 29-6M40 30a16 16 0 0 1-29 6"/><path d="M37 4v8h-8M11 44v-8h8"/></svg>
      <h3>Hassle-Free Exchange</h3>
      <p>Every piece is checked before dispatch. Wrong size? Exchange within 7 days, no questions asked.</p>
    </div>
    <div class="service reveal">
      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 26v-4a16 16 0 0 1 32 0v4"/><rect x="6" y="26" width="8" height="12" rx="2"/><rect x="34" y="26" width="8" height="12" rx="2"/><path d="M40 38c0 4-4 6-10 6h-4"/></svg>
      <h3>24/7 Support</h3>
      <p>Questions about sizing, orders or styling? Our team is here to help, any time you need us.</p>
    </div>
    <div class="service reveal">
      <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M24 4l16 6v12c0 10-7 18-16 22C15 40 8 32 8 22V10z"/><path d="M17 24l5 5 9-10"/></svg>
      <h3>Cash on Delivery</h3>
      <p>Pay when your order arrives. Simple, secure and available across the country.</p>
    </div>`;

  const cardHTML = (p, i = 0) => {
    const tags = [];
    if (p.oldPrice) tags.push(`<span class="tag tag--sale">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`);
    if (p.isNew) tags.push('<span class="tag tag--new">New</span>');
    if (p.tag && p.tag !== 'New') tags.push(`<span class="tag">${esc(p.tag)}</span>`);
    return `<article class="card" style="--d:${(i % 8) * 0.05}s">
      <div class="card__visual">
        <a class="card__media" href="${productUrl(p.id)}" aria-label="${esc(p.name)}">
          <img src="${img(p.img, 700)}" alt="${esc(p.name)}" loading="lazy">
        </a>
        <div class="card__tags">${tags.join('')}</div>
        <button type="button" class="card__wish" data-wish="${p.id}" aria-label="Add to wishlist" aria-pressed="false">${ICONS.heart}</button>
        <div class="card__actions">
          <button type="button" class="card__btn card__btn--quick" data-quick="${p.id}">Quick view</button>
          <button type="button" class="card__btn card__btn--dark" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
      <div class="card__info">
        <div>
          <p class="card__cat">${esc(CATEGORIES[p.cat])}</p>
          <h3 class="card__name"><a href="${productUrl(p.id)}">${esc(p.name)}</a></h3>
        </div>
        <p class="price ${p.oldPrice ? 'price--sale' : ''}">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</p>
      </div>
      <a class="card__buy" href="${whatsappUrl(p)}" target="_blank" rel="noopener" aria-label="Buy ${esc(p.name)} on WhatsApp">${WA_ICON}Buy Now</a>
    </article>`;
  };

  const breadcrumb = items => `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map((it, i) =>
    i === items.length - 1
      ? `<span aria-current="page">${esc(it.label)}</span>`
      : `<a href="${it.href}">${esc(it.label)}</a><span class="breadcrumb__sep">/</span>`).join('')}</nav>`;

  /* ---------- Page: collection ---------- */
  const SORTS = {
    featured: byRank,
    new: (a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || byRank(a, b),
    'price-asc': (a, b) => a.price - b.price,
    'price-desc': (a, b) => b.price - a.price,
    name: (a, b) => a.name.localeCompare(b.name)
  };
  const PRICES = {
    all: () => true,
    low: p => p.price < 3000,
    mid: p => p.price >= 3000 && p.price <= 7000,
    high: p => p.price > 7000
  };
  const MAIN_COLLECTIONS = ['shop', 'new-arrivals', 'tops', 'bottoms', 'winter-collection', 'tailoring', 'fragrance'];

  if (page === 'collection') {
    const col = collectionBySlug[document.body.dataset.collection] || collectionBySlug.shop;
    const all = PRODUCTS.filter(col.match);
    const parent = col.parent && collectionBySlug[col.parent];
    const family = parent || (col.children ? col : null);
    const chip = (slug, label) => `<a class="chip ${slug === col.slug ? 'is-active' : ''}" href="${slug}.html"${slug === col.slug ? ' aria-current="page"' : ''}>${esc(label)}</a>`;
    const others = MAIN_COLLECTIONS.filter(s => s !== col.slug && s !== col.parent && s !== 'shop').slice(0, 4);

    $('#main').innerHTML = `
      <section class="page-hero">
        <div class="page-hero__media parallax" data-speed="0.1"><img src="${img(col.img, 2000)}" alt=""></div>
        <div class="page-hero__content container">
          ${breadcrumb([{ label: 'Home', href: 'index.html' }, ...(parent ? [{ label: parent.title, href: `${parent.slug}.html` }] : []), { label: col.title }])}
          <p class="eyebrow">${esc(col.eyebrow)}</p>
          <h1 class="page-hero__title">${esc(col.title)}</h1>
          <p class="page-hero__desc">${esc(col.desc)}</p>
          <p class="page-hero__count">${all.length} ${all.length === 1 ? 'piece' : 'pieces'}</p>
        </div>
      </section>

      <section class="section section--tight shop">
        <div class="container">
          <div class="filters" aria-label="Collections">
            ${MAIN_COLLECTIONS.map(s => {
              const c = collectionBySlug[s];
              const active = s === col.slug || s === col.parent;
              return `<a class="chip ${active ? 'is-active' : ''}" href="${s}.html"${active ? ' aria-current="page"' : ''}>${esc(s === 'shop' ? 'All' : c.title)}</a>`;
            }).join('')}
          </div>
          ${family ? `<div class="filters filters--sub" aria-label="${esc(family.title)}">
            ${chip(family.slug, 'All')}${family.children.map(s => chip(s, collectionBySlug[s].title)).join('')}
          </div>` : ''}

          <div class="toolbar">
            <p class="shop__meta" aria-live="polite" id="resultCount"></p>
            <div class="toolbar__controls">
              <label class="select"><span class="visually-hidden">Filter by price</span>
                <select id="priceSelect">
                  <option value="all">All prices</option>
                  <option value="low">Under Rs. 3,000</option>
                  <option value="mid">Rs. 3,000 – 7,000</option>
                  <option value="high">Over Rs. 7,000</option>
                </select>
              </label>
              <label class="select"><span class="visually-hidden">Sort products</span>
                <select id="sortSelect">
                  <option value="featured">Featured</option>
                  <option value="new">Newest</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name">Alphabetical</option>
                </select>
              </label>
              <div class="view-toggle" role="group" aria-label="Products per row">
                <button type="button" data-cols="2" aria-label="2 per row"><svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="16"/><rect x="13" y="4" width="7" height="16"/></svg></button>
                <button type="button" data-cols="3" aria-label="3 per row"><svg viewBox="0 0 24 24"><rect x="3" y="4" width="4.5" height="16"/><rect x="9.75" y="4" width="4.5" height="16"/><rect x="16.5" y="4" width="4.5" height="16"/></svg></button>
                <button type="button" data-cols="4" aria-label="4 per row"><svg viewBox="0 0 24 24"><rect x="2.5" y="4" width="3.5" height="16"/><rect x="7.5" y="4" width="3.5" height="16"/><rect x="12.5" y="4" width="3.5" height="16"/><rect x="17.5" y="4" width="3.5" height="16"/></svg></button>
              </div>
            </div>
          </div>

          <div class="product-grid" id="productGrid"></div>
          <div class="shop__more"><button class="btn btn--outline" id="loadMore">Load more</button></div>
        </div>
      </section>

      <section class="section explore">
        <div class="container">
          <div class="section-head reveal">
            <p class="eyebrow eyebrow--dark">Keep Exploring</p>
            <h2 class="section-title">More <em>collections</em></h2>
          </div>
          <div class="explore__grid">
            ${others.map(s => {
              const c = collectionBySlug[s];
              return `<a href="${s}.html" class="col-card reveal">
                <img src="${img(c.img, 800)}" alt="" loading="lazy">
                <div class="col-card__body"><span class="col-card__count">${PRODUCTS.filter(c.match).length} pieces</span><h3>${esc(c.title)}</h3><span class="col-card__cta">Shop now</span></div>
              </a>`;
            }).join('')}
          </div>
        </div>
      </section>

      <section class="section services"><div class="container services__grid">${SERVICES}</div></section>`;

    const grid = $('#productGrid');
    const loadMore = $('#loadMore');
    const PAGE = 12;
    let sort = 'featured', price = 'all', shown = PAGE;

    const render = () => {
      const list = all.filter(PRICES[price]).sort(SORTS[sort]);
      const visible = list.slice(0, shown);
      grid.innerHTML = visible.length ? visible.map(cardHTML).join('')
        : `<div class="empty"><h3>Nothing in this range</h3><p>Try a different price filter, or <a href="shop.html">browse everything</a>.</p></div>`;
      $('#resultCount').textContent = `Showing ${visible.length} of ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
      loadMore.parentElement.hidden = visible.length >= list.length;
      syncWishButtons();
    };
    $('#sortSelect').addEventListener('change', e => { sort = e.target.value; render(); });
    $('#priceSelect').addEventListener('change', e => { price = e.target.value; shown = PAGE; render(); });
    loadMore.addEventListener('click', () => { shown += PAGE; render(); });

    const setCols = n => {
      grid.style.setProperty('--cols', n);
      $$('[data-cols]').forEach(b => b.setAttribute('aria-pressed', b.dataset.cols === String(n)));
      store.set('pl_cols', n);
    };
    $$('[data-cols]').forEach(b => b.addEventListener('click', () => setCols(+b.dataset.cols)));
    setCols(store.get('pl_cols', 4));

    // Keep the active chip in view on narrow screens.
    $$('.filters .chip.is-active').forEach(c => { c.parentElement.scrollLeft = c.offsetLeft - 16; });

    window.__renderPage = render;
  }

  /* ---------- Page: product ---------- */
  const DETAILS = {
    fragrance: {
      details: ['Eau de Parfum concentration (18–20%)', 'Long-lasting, 8–12 hours on skin', 'Presented in a gift-ready box', 'Made in small batches'],
      care: ['Store upright, away from heat and direct sunlight', 'Spray on pulse points from 15 cm', 'Do not rub after applying — let it settle']
    },
    tailoring: {
      details: ['Half-canvassed construction for natural drape', 'Wool-blend suiting', 'Fully lined with interior pockets', 'Regular tailored fit — take your usual size'],
      care: ['Dry clean only', 'Hang on a shaped hanger between wears', 'Steam to refresh — avoid direct ironing']
    },
    bottoms: {
      details: ['Mid-rise with a tapered leg', 'Belt loops, side and back pockets', 'Unfinished hem available on request', 'Model is 6\'0" and wears size 32'],
      care: ['Machine wash cold, inside out', 'Do not tumble dry', 'Warm iron if needed']
    },
    winter: {
      details: ['Cut to layer over knitwear', 'Fully lined for warmth', 'Interior and exterior pockets', 'Regular fit — size up for heavy layering'],
      care: ['Dry clean recommended', 'Store on a wide hanger', 'Brush gently to refresh between wears']
    },
    apparel: {
      details: ['Premium long-staple cotton', 'Tailored fit through the chest and waist', 'Reinforced seams and quality buttons', 'Model is 6\'0" and wears size M'],
      care: ['Machine wash at 30°C with similar colours', 'Do not bleach', 'Iron on medium heat']
    }
  };

  if (page === 'product') {
    const id = new URLSearchParams(location.search).get('id');
    const p = byId[id];
    const main = $('#main');

    if (!p) {
      main.innerHTML = `<section class="section notfound"><div class="container">
        <p class="eyebrow eyebrow--dark">Not found</p>
        <h1 class="section-title">This piece has <em>moved on</em></h1>
        <p>We couldn't find that product. It may have sold out or the link is incorrect.</p>
        <a class="btn btn--dark" href="shop.html">Browse the shop</a></div></section>`;
    } else {
      document.title = `${p.name} — PrimeLegacy`;
      const col = collectionBySlug[CAT_PAGE[p.cat]];
      const info = DETAILS[p.cat] || DETAILS.apparel;
      const isScent = p.cat === 'fragrance';
      const optLabel = isScent ? 'Volume' : (p.cat === 'bottoms' ? 'Waist' : 'Size');
      const related = PRODUCTS.filter(x => x.id !== p.id && x.cat === p.cat).sort(byRank)
        .concat(PRODUCTS.filter(x => x.cat !== p.cat).sort(byRank)).slice(0, 4);

      const recent = store.get('pl_recent', []).filter(r => r !== p.id && byId[r]);
      store.set('pl_recent', [p.id, ...recent].slice(0, 9));

      const tags = [];
      if (p.oldPrice) tags.push(`<span class="tag tag--sale">Save ${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`);
      if (p.isNew) tags.push('<span class="tag tag--new">New</span>');
      if (p.tag && p.tag !== 'New') tags.push(`<span class="tag tag--outline">${esc(p.tag)}</span>`);

      main.innerHTML = `
        <section class="pdp">
          <div class="container">
            ${breadcrumb([{ label: 'Home', href: 'index.html' }, { label: col.title, href: `${col.slug}.html` }, { label: p.name }])}
            <div class="pdp__grid">
              <div class="pdp__gallery">
                <div class="pdp__zoom" id="pdpZoom"><img src="${img(p.img, 1400)}" alt="${esc(p.name)}"></div>
                <p class="pdp__hint">Hover to zoom · Click to enlarge</p>
              </div>
              <div class="pdp__info">
                <div class="pdp__tags">${tags.join('')}</div>
                <p class="eyebrow eyebrow--dark">${esc(CATEGORIES[p.cat])}</p>
                <h1 class="pdp__title">${esc(p.name)}</h1>
                <p class="pdp__price ${p.oldPrice ? 'price--sale' : ''}">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</p>
                <p class="pdp__desc">${esc(p.desc)}</p>

                <div class="qv__opt-head"><span>${optLabel}: <strong id="pdpSizeLabel">Select</strong></span>${isScent ? '' : '<button type="button" class="link-btn" data-size-guide>Size guide</button>'}</div>
                <div class="sizes" id="pdpSizes" role="radiogroup" aria-label="Choose ${optLabel.toLowerCase()}">
                  ${p.sizes.map(s => `<button type="button" role="radio" class="size" aria-checked="false" data-size="${esc(s)}">${esc(s)}</button>`).join('')}
                </div>

                <div class="qv__actions" id="pdpActions">
                  <div class="qty" aria-label="Quantity">
                    <button type="button" data-pdp-qty="-1" aria-label="Decrease quantity">−</button>
                    <span id="pdpQty">1</span>
                    <button type="button" data-pdp-qty="1" aria-label="Increase quantity">+</button>
                  </div>
                  <button class="btn btn--dark qv__add" id="pdpAdd">Add to Cart</button>
                  <button class="icon-btn icon-btn--outline qv__wish" data-wish="${p.id}" aria-label="Add to wishlist" aria-pressed="false">${ICONS.heart}</button>
                </div>
                <button class="btn btn--whatsapp btn--block pdp__buy" id="pdpBuy">${WA_ICON}Buy Now on WhatsApp</button>
                <button type="button" class="pdp__share" id="pdpShare">
                  <svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg>
                  Share this piece
                </button>

                <ul class="qv__perks">
                  <li>Free shipping over ${money(STORE.freeShippingAt)}</li>
                  <li>7-day hassle-free exchange</li>
                  <li>Cash on delivery available nationwide</li>
                </ul>

                <div class="pdp__accordion">
                  <details class="faq__item" open><summary>Details${isScent ? '' : ' &amp; fit'}</summary><ul>${info.details.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
                  <details class="faq__item"><summary>${isScent ? 'How to wear' : 'Fabric &amp; care'}</summary><ul>${info.care.map(d => `<li>${esc(d)}</li>`).join('')}</ul></details>
                  <details class="faq__item"><summary>Shipping &amp; exchange</summary><p>Dispatched within 24 hours. Delivery in 2–4 working days to major cities, 4–6 days elsewhere. Unworn items with tags can be exchanged within 7 days${isScent ? ' (fragrances only if sealed)' : ''}.</p></details>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="section section--tight related">
          <div class="container">
            <div class="section-head section-head--row reveal">
              <h2 class="section-title">You may also <em>like</em></h2>
              <a href="${col.slug}.html" class="btn btn--outline">View ${esc(col.title)}</a>
            </div>
            <div class="product-grid">${related.map(cardHTML).join('')}</div>
          </div>
        </section>

        ${recent.length ? `<section class="section section--tight recent">
          <div class="container">
            <div class="section-head reveal"><h2 class="section-title">Recently <em>viewed</em></h2></div>
            <div class="product-grid">${recent.slice(0, 4).map(r => cardHTML(byId[r])).join('')}</div>
          </div>
        </section>` : ''}

        <section class="section services"><div class="container services__grid">${SERVICES}</div></section>

        <div class="sticky-atc" id="stickyAtc" aria-hidden="true">
          <img src="${img(p.img, 120)}" alt="">
          <div class="sticky-atc__text"><strong>${esc(p.name)}</strong><span>${money(p.price)}</span></div>
          <button class="btn btn--dark" id="stickyAdd">Add to Cart</button>
        </div>

        <div class="lightbox" id="lightbox" aria-hidden="true" role="dialog" aria-label="Enlarged image">
          <button class="icon-btn icon-btn--light lightbox__close" aria-label="Close">${ICONS.close}</button>
          <img src="${img(p.img, 2000)}" alt="${esc(p.name)}">
        </div>`;

      let size = p.sizes.length === 1 ? p.sizes[0] : null;
      let qty = 1;
      const sizes = $('#pdpSizes');
      const selectSize = s => {
        size = s;
        $('#pdpSizeLabel').textContent = s;
        $$('.size', sizes).forEach(b => { const on = b.dataset.size === s; b.classList.toggle('is-active', on); b.setAttribute('aria-checked', on); });
      };
      if (size) selectSize(size);
      sizes.addEventListener('click', e => { const b = e.target.closest('[data-size]'); if (b) selectSize(b.dataset.size); });
      $$('[data-pdp-qty]').forEach(b => b.addEventListener('click', () => {
        qty = Math.max(1, Math.min(10, qty + +b.dataset.pdpQty));
        $('#pdpQty').textContent = qty;
      }));

      const requireSize = () => {
        if (size) return true;
        sizes.classList.remove('shake'); void sizes.offsetWidth; sizes.classList.add('shake');
        sizes.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
        toast({ text: `Please choose a ${optLabel.toLowerCase()} first` });
        return false;
      };
      $('#pdpAdd').addEventListener('click', () => { if (requireSize()) addToCart(p.id, size, qty); });
      $('#stickyAdd').addEventListener('click', () => { if (requireSize()) addToCart(p.id, size, qty); });
      $('#pdpBuy').addEventListener('click', () => {
        if (requireSize()) window.open(whatsappUrl(p, size, qty), '_blank', 'noopener');
      });

      $('#pdpShare').addEventListener('click', async () => {
        const data = { title: `${p.name} — PrimeLegacy`, text: p.desc, url: location.href };
        if (navigator.share) {
          try { await navigator.share(data); } catch { /* share sheet dismissed */ }
          return;
        }
        try {
          await navigator.clipboard.writeText(location.href);
          toast({ text: 'Link copied', sub: 'Paste it anywhere to share this piece' });
        } catch {
          toast({ text: 'Copy this link to share', sub: location.href });
        }
      });

      bindZoom($('#pdpZoom'));
      const lightbox = $('#lightbox');
      const closeLightbox = () => { lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden', 'true'); unlock('lightbox'); };
      $('#pdpZoom').addEventListener('click', () => { lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden', 'false'); lock('lightbox'); });
      lightbox.addEventListener('click', closeLightbox);
      document.addEventListener('keydown', e => { if (e.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox(); });

      // Show the compact add-to-cart bar once the main button scrolls away.
      const sticky = $('#stickyAtc');
      new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', show);
        sticky.setAttribute('aria-hidden', !show);
      }).observe($('#pdpActions'));
    }
  }

  /* ---------- Page: home ---------- */
  if (page === 'home') {
    $('[data-services]').innerHTML = SERVICES;

    // One row per category: its products, then a button to the full category page.
    const HOME_ROWS = ['formal-shirts', 'casual-shirts', 'polos-tees', 'bottoms', 'winter-collection', 'tailoring', 'fragrance'];
    $('#categoryRows').innerHTML = HOME_ROWS.map((slug, i) => {
      const col = collectionBySlug[slug];
      const items = PRODUCTS.filter(col.match).sort(byRank);
      return `<section class="cat-row" id="row-${slug}">
        <div class="container">
          <div class="cat-row__head reveal">
            <div>
              <p class="eyebrow eyebrow--dark">${String(i + 1).padStart(2, '0')} · ${esc(col.eyebrow)}</p>
              <h2 class="cat-row__title"><a href="${slug}.html">${esc(col.title)}</a></h2>
            </div>
            <p class="cat-row__count">${items.length} ${items.length === 1 ? 'piece' : 'pieces'}</p>
          </div>
          <div class="product-grid cat-row__track">${items.slice(0, 4).map(cardHTML).join('')}</div>
          <div class="cat-row__foot">
            <a class="btn btn--dark" href="${slug}.html">View All Products</a>
          </div>
        </div>
      </section>`;
    }).join('');
  }

  /* ---------- Announcement bar ---------- */
  const msgs = $$('.announce__msg');
  let msgIndex = 0;
  setInterval(() => {
    const current = msgs[msgIndex];
    current.classList.remove('is-active');
    current.classList.add('is-leaving');
    setTimeout(() => current.classList.remove('is-leaving'), 600);
    msgIndex = (msgIndex + 1) % msgs.length;
    msgs[msgIndex].classList.add('is-active');
  }, 4500);

  /* ---------- Header ---------- */
  const header = $('#header');
  const heroEl = $('.hero, .page-hero');
  const toTop = $('#toTop');
  const progressRing = $('.to-top__progress');
  let lastY = window.scrollY;
  if (!heroEl) header.classList.add('header--static', 'is-solid');

  const onScroll = () => {
    const y = window.scrollY;
    if (heroEl) {
      const heroBottom = heroEl.offsetTop + heroEl.offsetHeight - header.offsetHeight;
      header.classList.toggle('is-solid', y > heroBottom - 40);
    }
    const goingDown = y > lastY && y > 400;
    header.classList.toggle('is-hidden', goingDown && !header.classList.contains('is-open'));
    lastY = y;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    toTop.classList.toggle('is-visible', y > 700);
    progressRing.style.strokeDashoffset = 138.2 * (1 - Math.min(y / Math.max(max, 1), 1));
    updateParallax();
  };
  window.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  const mega = $('.nav__item--mega');
  mega.addEventListener('mouseenter', () => header.classList.add('is-open'));
  mega.addEventListener('mouseleave', () => header.classList.remove('is-open'));
  mega.addEventListener('focusin', () => header.classList.add('is-open'));
  mega.addEventListener('focusout', e => { if (!mega.contains(e.relatedTarget)) header.classList.remove('is-open'); });

  /* ---------- Overlay coordination ---------- */
  const overlay = $('#overlay');
  const showOverlay = () => { overlay.hidden = false; requestAnimationFrame(() => overlay.classList.add('is-visible')); };
  const hideOverlay = () => { overlay.classList.remove('is-visible'); setTimeout(() => { if (!overlay.classList.contains('is-visible')) overlay.hidden = true; }, 500); };
  overlay.addEventListener('click', () => { closeDrawer(); closeMobileNav(); });

  /* ---------- Mobile nav ---------- */
  const mobileNav = $('#mobileNav');
  const menuOpen = $('#menuOpen');
  const openMobileNav = () => {
    mobileNav.classList.add('is-open'); mobileNav.setAttribute('aria-hidden', 'false');
    menuOpen.setAttribute('aria-expanded', 'true');
    $$('.mobile-nav__links a').forEach((a, i) => { a.style.transitionDelay = `${0.1 + i * 0.035}s`; });
    showOverlay(); lock('nav');
    $('#menuClose').focus();
  };
  function closeMobileNav() {
    if (!mobileNav.classList.contains('is-open')) return;
    mobileNav.classList.remove('is-open'); mobileNav.setAttribute('aria-hidden', 'true');
    menuOpen.setAttribute('aria-expanded', 'false');
    $$('.mobile-nav__links a').forEach(a => { a.style.transitionDelay = '0s'; });
    hideOverlay(); unlock('nav');
  }
  menuOpen.addEventListener('click', openMobileNav);
  $('#menuClose').addEventListener('click', closeMobileNav);
  $$('.mobile-nav__links a').forEach(a => a.addEventListener('click', closeMobileNav));

  /* ---------- Hero slider (home) ---------- */
  const hero = $('.hero');
  if (hero) {
    const slides = $$('.hero__slide');
    const dots = $$('.hero__dot');
    const heroCurrent = $('[data-hero-current]');
    const HERO_DUR = 6500;
    let heroIndex = 0;
    let heroTimer;
    hero.style.setProperty('--hero-dur', `${HERO_DUR}ms`);

    const restartHero = () => {
      clearTimeout(heroTimer);
      if (!reduceMotion) heroTimer = setTimeout(() => goTo(heroIndex + 1), HERO_DUR);
    };
    const goTo = i => {
      heroIndex = (i + slides.length) % slides.length;
      slides.forEach((s, n) => s.classList.toggle('is-active', n === heroIndex));
      dots.forEach((d, n) => {
        d.classList.remove('is-active');
        d.setAttribute('aria-selected', n === heroIndex);
        if (n === heroIndex) { void d.offsetWidth; d.classList.add('is-active'); }
      });
      heroCurrent.textContent = String(heroIndex + 1).padStart(2, '0');
      const lazy = slides[heroIndex].querySelector('img[loading="lazy"]');
      if (lazy) lazy.loading = 'eager';
      restartHero();
    };
    dots.forEach((d, n) => d.addEventListener('click', () => goTo(n)));
    $('[data-hero-prev]').addEventListener('click', () => goTo(heroIndex - 1));
    $('[data-hero-next]').addEventListener('click', () => goTo(heroIndex + 1));
    hero.addEventListener('mouseenter', () => { hero.classList.add('is-paused'); clearTimeout(heroTimer); });
    hero.addEventListener('mouseleave', () => { hero.classList.remove('is-paused'); restartHero(); });

    let touchX = null;
    hero.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener('touchend', e => {
      if (touchX === null) return;
      const dx = e.changedTouches[0].clientX - touchX;
      if (Math.abs(dx) > 50) goTo(heroIndex + (dx < 0 ? 1 : -1));
      touchX = null;
    });
    restartHero();
  }

  /* ---------- Reveal on scroll ---------- */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  /* ---------- Counters ---------- */
  const counterObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.counter;
      const start = performance.now();
      const dur = reduceMotion ? 1 : 1800;
      const tick = now => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 4)));
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-counter]').forEach(el => counterObserver.observe(el));

  /* ---------- Parallax ---------- */
  const parallaxEls = $$('.parallax');
  function updateParallax() {
    if (reduceMotion) return;
    const vh = window.innerHeight;
    parallaxEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > vh) return;
      const limit = rect.height * 0.07; // stays inside the image's 1.15 scale overscan
      const raw = (rect.top + rect.height / 2 - vh / 2) * parseFloat(el.dataset.speed);
      const offset = Math.max(-limit, Math.min(limit, raw));
      const target = el.querySelector('img') || el;
      target.style.transform = `translate3d(0, ${offset}px, 0) scale(1.15)`;
    });
  }

  /* ---------- Toasts ---------- */
  const toasts = $('#toasts');
  function toast({ text, sub, image, action, onAction }) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${image ? `<img src="${img(image, 120)}" alt="">` : ''}
      <div class="toast__text">${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>
      ${action ? `<button type="button">${esc(action)}</button>` : ''}`;
    const dismiss = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 400); };
    if (action) el.querySelector('button').addEventListener('click', () => { onAction(); dismiss(); });
    toasts.appendChild(el);
    setTimeout(dismiss, 3800);
    while (toasts.children.length > 3) toasts.firstElementChild.remove();
  }

  /* ---------- Cart & wishlist state ---------- */
  let cart = store.get('pl_cart', []).filter(l => byId[l.id]);
  let wish = store.get('pl_wish', []).filter(id => byId[id]);

  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => cart.reduce((n, l) => n + byId[l.id].price * l.qty, 0);
  const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

  const syncBadges = animate => {
    const cc = cartCount(), wc = wish.length;
    $$('[data-cart-count]').forEach(b => { b.textContent = cc; b.hidden = !cc; if (animate === 'cart') bump(b); });
    $$('[data-wish-count]').forEach(b => { b.textContent = wc; b.hidden = !wc; if (animate === 'wish') bump(b); });
    $$('[data-cart-count-inline]').forEach(b => { b.textContent = `(${cc})`; });
    $$('[data-wish-count-inline]').forEach(b => { b.textContent = `(${wc})`; });
  };

  const saveCart = () => { store.set('pl_cart', cart); syncBadges(); renderDrawer(); };
  const saveWish = () => { store.set('pl_wish', wish); syncBadges(); renderDrawer(); syncWishButtons(); };

  function addToCart(id, size, qty = 1, { silent = false } = {}) {
    const p = byId[id];
    size = size || p.sizes[Math.min(2, p.sizes.length - 1)];
    const line = cart.find(l => l.id === id && l.size === size);
    if (line) line.qty = Math.min(line.qty + qty, 10);
    else cart.push({ id, size, qty });
    saveCart();
    syncBadges('cart');
    if (!silent) toast({ text: `${p.name} added to cart`, sub: `${p.cat === 'fragrance' ? 'Volume' : 'Size'} ${size} · Qty ${qty}`, image: p.img, action: 'View cart', onAction: () => openDrawer('cart') });
  }

  const toggleWish = id => {
    const p = byId[id];
    const had = wish.includes(id);
    wish = had ? wish.filter(w => w !== id) : [...wish, id];
    saveWish();
    if (!had) {
      syncBadges('wish');
      toast({ text: 'Saved to wishlist', sub: p.name, image: p.img, action: 'View', onAction: () => openDrawer('wish') });
    }
  };

  function syncWishButtons() {
    $$('[data-wish]').forEach(b => {
      const on = wish.includes(b.dataset.wish);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    });
  }

  // Product actions work the same anywhere on the page.
  document.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    const w = e.target.closest('[data-wish]');
    const quick = e.target.closest('[data-quick]');
    if (add) addToCart(add.dataset.add);
    else if (w) toggleWish(w.dataset.wish);
    else if (quick) openQuickView(quick.dataset.quick);
  });

  /* ---------- Drawer ---------- */
  const drawer = $('#drawer');
  const drawerBody = $('#drawerBody');
  const drawerFoot = $('#drawerFoot');
  const shipBox = $('[data-ship]');
  let drawerTab = 'cart';
  let lastFocus = null;

  const emptyState = (title, text, icon) => `
    <div class="drawer-empty">${icon}<h4>${title}</h4><p>${text}</p>
      <a class="btn btn--dark" href="shop.html">Start shopping</a></div>`;

  function renderDrawer() {
    $$('.drawer__tab').forEach(t => t.classList.toggle('is-active', t.dataset.drawerTab === drawerTab));
    if (drawerTab === 'cart') {
      const total = cartTotal();
      const left = STORE.freeShippingAt - total;
      shipBox.hidden = !cart.length;
      $('[data-ship-text]').innerHTML = left > 0
        ? `You're <strong>${money(left)}</strong> away from free shipping`
        : `You've unlocked <strong>free shipping</strong> ✦`;
      $('[data-ship-bar]').style.width = `${Math.min(total / STORE.freeShippingAt, 1) * 100}%`;
      drawerFoot.hidden = !cart.length;
      $('[data-subtotal]').textContent = money(total);
      drawerBody.innerHTML = cart.length ? cart.map((l, i) => {
        const p = byId[l.id];
        return `<div class="line-item">
          <a href="${productUrl(p.id)}"><img src="${img(p.img, 200)}" alt="${esc(p.name)}"></a>
          <div>
            <a class="line-item__name" href="${productUrl(p.id)}">${esc(p.name)}</a>
            <p class="line-item__meta">${p.cat === 'fragrance' ? 'Volume' : 'Size'}: ${esc(l.size)} · ${money(p.price)}</p>
            <div class="qty">
              <button type="button" data-line-qty="${i}" data-step="-1" aria-label="Decrease quantity">−</button>
              <span>${l.qty}</span>
              <button type="button" data-line-qty="${i}" data-step="1" aria-label="Increase quantity">+</button>
            </div>
          </div>
          <div class="line-item__side">
            <strong>${money(p.price * l.qty)}</strong>
            <button type="button" class="line-item__remove" data-line-remove="${i}">Remove</button>
          </div>
        </div>`;
      }).join('') : emptyState('Your cart is empty', 'Discover pieces built to last a lifetime.', ICONS.bag);
    } else {
      shipBox.hidden = true;
      drawerFoot.hidden = true;
      drawerBody.innerHTML = wish.length ? wish.map(id => {
        const p = byId[id];
        return `<div class="line-item">
          <a href="${productUrl(p.id)}"><img src="${img(p.img, 200)}" alt="${esc(p.name)}"></a>
          <div>
            <a class="line-item__name" href="${productUrl(p.id)}">${esc(p.name)}</a>
            <p class="line-item__meta">${money(p.price)}</p>
            <button type="button" class="btn btn--dark btn--add" data-drawer-quick="${p.id}">Choose size</button>
          </div>
          <div class="line-item__side">
            <span></span>
            <button type="button" class="line-item__remove" data-wish-remove="${p.id}">Remove</button>
          </div>
        </div>`;
      }).join('') : emptyState('No saved pieces yet', 'Tap the heart on any product to save it for later.', ICONS.heart);
    }
  }

  function openDrawer(tab = 'cart') {
    drawerTab = tab;
    renderDrawer();
    lastFocus = document.activeElement;
    drawer.classList.add('is-open'); drawer.setAttribute('aria-hidden', 'false');
    showOverlay(); lock('drawer');
    setTimeout(() => $('#drawerClose').focus(), 50);
  }
  function closeDrawer() {
    if (!drawer.classList.contains('is-open')) return;
    drawer.classList.remove('is-open'); drawer.setAttribute('aria-hidden', 'true');
    hideOverlay(); unlock('drawer');
    lastFocus?.focus?.();
  }

  $('#cartOpen').addEventListener('click', () => openDrawer('cart'));
  $('#wishOpen').addEventListener('click', () => openDrawer('wish'));
  $('#drawerClose').addEventListener('click', closeDrawer);
  $$('[data-drawer-close]').forEach(b => b.addEventListener('click', closeDrawer));
  $$('.drawer__tab').forEach(t => t.addEventListener('click', () => { drawerTab = t.dataset.drawerTab; renderDrawer(); }));

  drawerBody.addEventListener('click', e => {
    const qtyBtn = e.target.closest('[data-line-qty]');
    const rm = e.target.closest('[data-line-remove]');
    const wrm = e.target.closest('[data-wish-remove]');
    const quick = e.target.closest('[data-drawer-quick]');
    if (qtyBtn) {
      const line = cart[+qtyBtn.dataset.lineQty];
      line.qty = Math.max(1, Math.min(10, line.qty + +qtyBtn.dataset.step));
      saveCart();
    } else if (rm) {
      const [removed] = cart.splice(+rm.dataset.lineRemove, 1);
      saveCart();
      toast({ text: `Removed ${byId[removed.id].name}`, action: 'Undo', onAction: () => { cart.push(removed); saveCart(); } });
    } else if (wrm) {
      wish = wish.filter(w => w !== wrm.dataset.wishRemove); saveWish();
    } else if (quick) {
      closeDrawer(); openQuickView(quick.dataset.drawerQuick);
    }
  });

  /* ---------- Modals ---------- */
  const openModal = modal => {
    lastFocus = document.activeElement;
    modal.classList.add('is-open'); modal.setAttribute('aria-hidden', 'false');
    lock(modal.id);
    setTimeout(() => modal.querySelector('[data-modal-close]').focus(), 50);
  };
  const closeModal = modal => {
    if (!modal.classList.contains('is-open')) return;
    modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true');
    unlock(modal.id);
    lastFocus?.focus?.();
  };
  $$('.modal').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m || e.target.closest('[data-modal-close]')) closeModal(m); });
  });

  function bindZoom(box) {
    box.addEventListener('mousemove', e => {
      const r = box.getBoundingClientRect();
      box.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
      box.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
    box.addEventListener('mouseenter', () => box.classList.add('is-zoom'));
    box.addEventListener('mouseleave', () => box.classList.remove('is-zoom'));
  }

  /* ---------- Quick view ---------- */
  const qv = $('#quickView');
  const qvSizes = $('#qvSizes');
  let qvProduct = null, qvSize = null, qvQty = 1;

  function openQuickView(id) {
    const p = byId[id];
    if (!p) return;
    qvProduct = p; qvSize = p.sizes.length === 1 ? p.sizes[0] : null; qvQty = 1;
    $('#qvImg').src = img(p.img, 1100);
    $('#qvImg').alt = p.name;
    $('#qvCat').textContent = CATEGORIES[p.cat];
    $('#qvTitle').textContent = p.name;
    $('#qvPrice').innerHTML = `${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}`;
    $('#qvDesc').textContent = p.desc;
    $('#qvQty').textContent = qvQty;
    $('#qvMore').href = productUrl(p.id);
    const isScent = p.cat === 'fragrance';
    $('#qvOptLabel').textContent = isScent ? 'Volume' : (p.cat === 'bottoms' ? 'Waist' : 'Size');
    $('#qvSizeGuide').hidden = isScent;
    qvSizes.innerHTML = p.sizes.map(s => `<button type="button" role="radio" class="size ${s === qvSize ? 'is-active' : ''}" aria-checked="${s === qvSize}" data-size="${esc(s)}">${esc(s)}</button>`).join('');
    $('#qvWish').dataset.wish = p.id;
    syncWishButtons();
    openModal(qv);
  }

  qvSizes.addEventListener('click', e => {
    const b = e.target.closest('[data-size]');
    if (!b) return;
    qvSize = b.dataset.size;
    $$('.size', qvSizes).forEach(s => { const on = s === b; s.classList.toggle('is-active', on); s.setAttribute('aria-checked', on); });
  });
  $$('[data-qv-qty]').forEach(b => b.addEventListener('click', () => {
    qvQty = Math.max(1, Math.min(10, qvQty + +b.dataset.qvQty));
    $('#qvQty').textContent = qvQty;
  }));
  $('#qvAdd').addEventListener('click', () => {
    if (!qvSize) {
      qvSizes.classList.remove('shake'); void qvSizes.offsetWidth; qvSizes.classList.add('shake');
      toast({ text: `Please choose a ${$('#qvOptLabel').textContent.toLowerCase()} first` });
      return;
    }
    addToCart(qvProduct.id, qvSize, qvQty);
    closeModal(qv);
  });
  bindZoom($('#qvZoom'));

  /* ---------- Size guide ---------- */
  const sgModal = $('#sizeGuide');
  const SIZE_DATA = {
    tops: { head: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'], rows: [
      ['XS', 36, 27.5, 16.5, 24], ['S', 38, 28, 17, 24.5], ['M', 40, 29, 17.75, 25],
      ['L', 42, 30, 18.5, 25.5], ['XL', 44, 31, 19.25, 26], ['XXL', 46, 32, 20, 26.5]] },
    bottoms: { head: ['Size', 'Waist', 'Hip', 'Inseam', 'Leg opening'], rows: [
      ['28', 28, 36, 30, 6.5], ['30', 30, 38, 30.5, 6.75], ['32', 32, 40, 31, 7],
      ['34', 34, 42, 31.5, 7.25], ['36', 36, 44, 32, 7.5], ['38', 38, 46, 32, 7.75]] }
  };
  let sgType = 'tops', sgUnit = 'in';
  const renderSizeGuide = () => {
    const d = SIZE_DATA[sgType];
    const conv = v => sgUnit === 'cm' ? (v * 2.54).toFixed(1) : v;
    $('#sgTable').innerHTML = `<thead><tr>${d.head.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${d.rows.map(r => `<tr>${r.map((c, i) => `<td>${i === 0 ? `<strong>${c}</strong>` : conv(c)}</td>`).join('')}</tr>`).join('')}</tbody>`;
    $$('[data-sg]').forEach(b => { const on = b.dataset.sg === sgType; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', on); });
    $$('[data-unit]').forEach(b => b.classList.toggle('is-active', b.dataset.unit === sgUnit));
  };
  $$('[data-sg]').forEach(b => b.addEventListener('click', () => { sgType = b.dataset.sg; renderSizeGuide(); }));
  $$('[data-unit]').forEach(b => b.addEventListener('click', () => { sgUnit = b.dataset.unit; renderSizeGuide(); }));
  document.addEventListener('click', e => {
    if (!e.target.closest('[data-size-guide]')) return;
    const context = qv.classList.contains('is-open') ? qvProduct : (page === 'product' ? byId[new URLSearchParams(location.search).get('id')] : null);
    if (context) sgType = context.cat === 'bottoms' ? 'bottoms' : 'tops';
    renderSizeGuide(); openModal(sgModal);
  });

  /* ---------- Checkout ---------- */
  const coModal = $('#checkout');
  function openCheckout() {
    if (!cart.length) return;
    const lines = cart.map(l => {
      const p = byId[l.id];
      return { text: `${p.name} (${l.size}) × ${l.qty}`, amount: money(p.price * l.qty) };
    });
    const total = cartTotal();
    const shipping = total >= STORE.freeShippingAt ? 'Free' : 'Calculated on confirmation';
    $('#coSummary').innerHTML = lines.map(l => `<div class="co__line"><span>${esc(l.text)}</span><span>${l.amount}</span></div>`).join('')
      + `<div class="co__line"><span>Shipping</span><span>${shipping}</span></div>`
      + `<div class="co__line co__total"><span>Total</span><span>${money(total)}</span></div>`;
    const message = `Hello ${STORE.name}! I'd like to place an order:\n\n${lines.map(l => `• ${l.text} — ${l.amount}`).join('\n')}\n\nSubtotal: ${money(total)}\nShipping: ${shipping}\n\nName:\nCity:\nAddress:\nPhone:`;
    $('#coWhatsapp').href = `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(message)}`;
    $('#coEmail').href = `mailto:${STORE.email}?subject=${encodeURIComponent('New order')}&body=${encodeURIComponent(message)}`;
    closeDrawer();
    openModal(coModal);
  }
  $('#checkoutBtn').addEventListener('click', openCheckout);

  /* ---------- Search ---------- */
  const search = $('#search');
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');

  const highlight = (text, q) => {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp(`(${esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  };
  const runSearch = () => {
    const q = searchInput.value.trim().toLowerCase();
    const list = q
      ? PRODUCTS.filter(p => `${p.name} ${CATEGORIES[p.cat]} ${p.desc}`.toLowerCase().includes(q))
      : [...PRODUCTS].sort(byRank).slice(0, 6);
    searchResults.innerHTML = list.length
      ? list.slice(0, 12).map(p => `<a class="sr" href="${productUrl(p.id)}">
          <img src="${img(p.img, 400)}" alt="" loading="lazy"><p>${highlight(p.name, q)}</p><span>${money(p.price)}</span></a>`).join('')
      : `<p class="search__empty">No results for “${esc(q)}”. Try “shirt”, “jacket” or “oud”.</p>`;
  };
  const openSearch = () => {
    lastFocus = document.activeElement;
    search.classList.add('is-open'); search.setAttribute('aria-hidden', 'false'); lock('search');
    runSearch();
    setTimeout(() => searchInput.focus(), 100);
  };
  const closeSearch = () => {
    if (!search.classList.contains('is-open')) return;
    search.classList.remove('is-open'); search.setAttribute('aria-hidden', 'true'); unlock('search');
    lastFocus?.focus?.();
  };
  $('#searchOpen').addEventListener('click', openSearch);
  $('#searchClose').addEventListener('click', closeSearch);
  searchInput.addEventListener('input', runSearch);
  $$('[data-term]').forEach(b => b.addEventListener('click', () => { searchInput.value = b.dataset.term; runSearch(); searchInput.focus(); }));

  /* ---------- Lookbook (home) ---------- */
  const track = $('#lookTrack');
  if (track) {
    const lookProgress = $('#lookProgress');
    track.innerHTML = LOOKBOOK.map((l, i) => `<figure class="look">
        <div class="look__media"><img src="${img(l.img, 800)}" alt="Lookbook look ${i + 1}: ${esc(l.title)}" loading="lazy" draggable="false">
          <span class="look__num">${String(i + 1).padStart(2, '0')}</span></div>
        <figcaption class="look__foot"><span class="look__title">${esc(l.title)}</span>
          <button type="button" class="look__shop" data-quick="${l.product}">Shop the look</button></figcaption>
      </figure>`).join('');

    const updateLookProgress = () => {
      const max = track.scrollWidth - track.clientWidth;
      const ratio = track.clientWidth / track.scrollWidth;
      lookProgress.style.width = `${ratio * 100}%`;
      lookProgress.style.transform = `translateX(${max > 0 ? (track.scrollLeft / max) * ((1 - ratio) / ratio) * 100 : 0}%)`;
    };
    track.addEventListener('scroll', () => requestAnimationFrame(updateLookProgress), { passive: true });
    window.addEventListener('resize', updateLookProgress);
    updateLookProgress();

    const lookStep = () => (track.querySelector('.look')?.offsetWidth || 300) + 20;
    $('[data-look-prev]').addEventListener('click', () => track.scrollBy({ left: -lookStep(), behavior: 'smooth' }));
    $('[data-look-next]').addEventListener('click', () => track.scrollBy({ left: lookStep(), behavior: 'smooth' }));
    track.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight') track.scrollBy({ left: lookStep(), behavior: 'smooth' });
      if (e.key === 'ArrowLeft') track.scrollBy({ left: -lookStep(), behavior: 'smooth' });
    });

    // Mouse drag-to-scroll (touch devices scroll natively).
    let drag = null;
    track.addEventListener('pointerdown', e => {
      if (e.pointerType !== 'mouse' || e.target.closest('button')) return;
      drag = { x: e.clientX, left: track.scrollLeft };
    });
    window.addEventListener('pointermove', e => {
      if (!drag) return;
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) > 4) track.classList.add('is-dragging');
      track.scrollLeft = drag.left - dx;
    });
    window.addEventListener('pointerup', () => {
      if (!drag) return;
      drag = null;
      track.classList.remove('is-dragging');
    });
  }

  /* ---------- Fragrance notes (home) ---------- */
  $$('.notes__tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.notes__tab').forEach(t => { const on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    $$('.notes__panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.note));
  }));

  /* ---------- Forms (home) ---------- */
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  $('#newsletterForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const input = $('#nlEmail');
    const msg = e.target.querySelector('.form-msg');
    if (!emailOk(input.value.trim())) {
      msg.textContent = 'Please enter a valid email address.';
      msg.className = 'form-msg is-error';
      input.focus();
      return;
    }
    const subs = store.get('pl_subscribers', []);
    store.set('pl_subscribers', [...new Set([...subs, input.value.trim().toLowerCase()])]);
    msg.textContent = 'Welcome to the Inner Circle — watch your inbox for early access.';
    msg.className = 'form-msg is-ok';
    input.value = '';
  });

  $('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const form = e.target;
    const msg = form.querySelector('.form-msg');
    let valid = true;
    $$('.field', form).forEach(f => {
      const el = f.querySelector('input, textarea, select');
      const ok = el.type === 'email' ? emailOk(el.value.trim()) : el.value.trim() !== '';
      f.classList.toggle('is-invalid', !ok);
      if (!ok) valid = false;
    });
    if (!valid) {
      msg.textContent = 'Please complete all fields with valid details.';
      msg.className = 'form-msg is-error';
      return;
    }
    const data = Object.fromEntries(new FormData(form));
    const body = `Name: ${data.name}\nEmail: ${data.email}\nTopic: ${data.topic}\n\n${data.message}`;
    window.location.href = `mailto:${STORE.email}?subject=${encodeURIComponent(`[Website] ${data.topic}`)}&body=${encodeURIComponent(body)}`;
    msg.textContent = 'Opening your email app to send the message…';
    msg.className = 'form-msg is-ok';
    form.reset();
  });
  $$('.field input, .field textarea, .field select').forEach(el =>
    el.addEventListener('input', () => el.closest('.field').classList.remove('is-invalid')));

  /* ---------- Global keyboard ---------- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const openModalEl = $$('.modal.is-open').pop();
      if (openModalEl) closeModal(openModalEl);
      else if (search.classList.contains('is-open')) closeSearch();
      else { closeDrawer(); closeMobileNav(); }
    }
    if (e.key === '/' && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openSearch();
    }
  });

  /* ---------- Init ---------- */
  window.__renderPage?.();
  // Re-observe reveal elements added by page renderers above.
  $$('.reveal:not(.is-in)').forEach(el => revealObserver.observe(el));
  syncBadges();
  syncWishButtons();
  renderDrawer();
  onScroll();
})();

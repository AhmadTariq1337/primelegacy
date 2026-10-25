(() => {
  'use strict';

  const { STORE, PRODUCTS, CATEGORIES, LOOKBOOK } = window;
  const $ = (s, ctx = document) => ctx.querySelector(s);
  const $$ = (s, ctx = document) => [...ctx.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = Object.fromEntries(PRODUCTS.map(p => [p.id, p]));

  const img = (id, w = 800) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
  const money = n => `${STORE.currency} ${n.toLocaleString('en-PK')}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

  /* ---------- Preloader ---------- */
  const finishLoading = () => {
    document.body.classList.add('is-loaded');
    document.body.classList.remove('is-loading');
  };
  if (reduceMotion) finishLoading();
  else window.addEventListener('load', () => setTimeout(finishLoading, 900));
  setTimeout(finishLoading, 3500); // never block the page on slow images

  /* ---------- Scroll locking for overlays ---------- */
  const locks = new Set();
  const lock = key => { locks.add(key); document.body.classList.add('no-scroll'); };
  const unlock = key => { locks.delete(key); if (!locks.size) document.body.classList.remove('no-scroll'); };

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
  const hero = $('.hero');
  const toTop = $('#toTop');
  const progressRing = $('.to-top__progress');
  let lastY = window.scrollY;

  const onScroll = () => {
    const y = window.scrollY;
    const heroBottom = hero.offsetTop + hero.offsetHeight - header.offsetHeight;
    header.classList.toggle('is-solid', y > heroBottom - 40);
    const goingDown = y > lastY && y > 400;
    header.classList.toggle('is-hidden', goingDown && !header.classList.contains('is-open'));
    lastY = y;

    const max = document.documentElement.scrollHeight - window.innerHeight;
    toTop.classList.toggle('is-visible', y > 700);
    progressRing.style.strokeDashoffset = 138.2 * (1 - Math.min(y / max, 1));
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

  /* ---------- Hero slider ---------- */
  const slides = $$('.hero__slide');
  const dots = $$('.hero__dot');
  const heroCurrent = $('[data-hero-current]');
  const HERO_DUR = 6500;
  let heroIndex = 0;
  let heroTimer;
  hero.style.setProperty('--hero-dur', `${HERO_DUR}ms`);

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
  const restartHero = () => {
    clearTimeout(heroTimer);
    if (!reduceMotion) heroTimer = setTimeout(() => goTo(heroIndex + 1), HERO_DUR);
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
  updateParallax();

  /* ---------- Custom cursor ---------- */
  const cursor = $('.cursor');
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduceMotion) {
    const label = $('.cursor__label');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    const loop = () => {
      cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2;
      cursor.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.addEventListener('mouseover', e => {
      const labelled = e.target.closest('[data-cursor]');
      const interactive = e.target.closest('a, button, select, input, textarea, summary, .card__media');
      cursor.classList.toggle('is-label', !!labelled);
      cursor.classList.toggle('is-hover', !labelled && !!interactive);
      label.textContent = labelled ? labelled.dataset.cursor : '';
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = 0; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = 1; });
  } else {
    cursor.remove();
  }

  /* ---------- Toasts ---------- */
  const toasts = $('#toasts');
  const toast = ({ text, sub, image, action, onAction }) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${image ? `<img src="${img(image, 120)}" alt="">` : ''}
      <div class="toast__text">${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>
      ${action ? `<button type="button">${esc(action)}</button>` : ''}`;
    if (action) el.querySelector('button').addEventListener('click', () => { onAction(); dismiss(); });
    toasts.appendChild(el);
    const dismiss = () => { el.classList.add('is-out'); setTimeout(() => el.remove(), 400); };
    setTimeout(dismiss, 3800);
    while (toasts.children.length > 3) toasts.firstElementChild.remove();
  };

  /* ---------- Cart & wishlist state ---------- */
  let cart = store.get('pl_cart', []).filter(l => byId[l.id]);
  let wish = store.get('pl_wish', []).filter(id => byId[id]);

  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  const cartTotal = () => cart.reduce((n, l) => n + byId[l.id].price * l.qty, 0);

  const bump = el => { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); };

  const syncBadges = (animate) => {
    const cc = cartCount(), wc = wish.length;
    $$('[data-cart-count]').forEach(b => { b.textContent = cc; b.hidden = !cc; if (animate === 'cart') bump(b); });
    $$('[data-wish-count]').forEach(b => { b.textContent = wc; b.hidden = !wc; if (animate === 'wish') bump(b); });
    $$('[data-cart-count-inline]').forEach(b => { b.textContent = `(${cc})`; });
    $$('[data-wish-count-inline]').forEach(b => { b.textContent = `(${wc})`; });
  };

  const saveCart = () => { store.set('pl_cart', cart); syncBadges(); renderDrawer(); };
  const saveWish = () => { store.set('pl_wish', wish); syncBadges(); renderDrawer(); syncWishButtons(); };

  const addToCart = (id, size, qty = 1) => {
    const p = byId[id];
    size = size || p.sizes[Math.min(2, p.sizes.length - 1)];
    const line = cart.find(l => l.id === id && l.size === size);
    if (line) line.qty = Math.min(line.qty + qty, 10);
    else cart.push({ id, size, qty });
    saveCart();
    syncBadges('cart');
    toast({ text: `${p.name} added to cart`, sub: `Size ${size} · Qty ${qty}`, image: p.img, action: 'View cart', onAction: () => openDrawer('cart') });
  };

  const toggleWish = id => {
    const p = byId[id];
    const had = wish.includes(id);
    wish = had ? wish.filter(w => w !== id) : [...wish, id];
    saveWish();
    if (!had) {
      syncBadges('wish');
      toast({ text: `Saved to wishlist`, sub: p.name, image: p.img, action: 'View', onAction: () => openDrawer('wish') });
    }
  };

  const syncWishButtons = () => {
    $$('[data-wish]').forEach(b => {
      const on = wish.includes(b.dataset.wish);
      b.classList.toggle('is-active', on);
      b.setAttribute('aria-pressed', on);
      b.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    });
  };

  /* ---------- Drawer ---------- */
  const drawer = $('#drawer');
  const drawerBody = $('#drawerBody');
  const drawerFoot = $('#drawerFoot');
  const shipBox = $('[data-ship]');
  let drawerTab = 'cart';
  let lastFocus = null;

  const emptyState = (title, text, icon) => `
    <div class="drawer-empty">${icon}<h4>${title}</h4><p>${text}</p>
      <button class="btn btn--dark" data-drawer-shop>Start shopping</button></div>`;

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
          <img src="${img(p.img, 200)}" alt="${esc(p.name)}" data-open="${p.id}">
          <div>
            <p class="line-item__name" data-open="${p.id}">${esc(p.name)}</p>
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
      }).join('') : emptyState('Your cart is empty', 'Discover pieces built to last a lifetime.',
        '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>');
    } else {
      shipBox.hidden = true;
      drawerFoot.hidden = true;
      drawerBody.innerHTML = wish.length ? wish.map(id => {
        const p = byId[id];
        return `<div class="line-item">
          <img src="${img(p.img, 200)}" alt="${esc(p.name)}" data-open="${p.id}">
          <div>
            <p class="line-item__name" data-open="${p.id}">${esc(p.name)}</p>
            <p class="line-item__meta">${money(p.price)}</p>
            <button type="button" class="btn btn--dark btn--add" data-open="${p.id}">Choose size</button>
          </div>
          <div class="line-item__side">
            <span></span>
            <button type="button" class="line-item__remove" data-wish-remove="${p.id}">Remove</button>
          </div>
        </div>`;
      }).join('') : emptyState('No saved pieces yet', 'Tap the heart on any product to save it for later.',
        '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>');
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
    const open = e.target.closest('[data-open]');
    const shop = e.target.closest('[data-drawer-shop]');
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
    } else if (open) {
      closeDrawer(); openQuickView(open.dataset.open);
    } else if (shop) {
      closeDrawer(); setFilter('all', true);
    }
  });

  /* ---------- Shop grid ---------- */
  const grid = $('#productGrid');
  const loadMore = $('#loadMore');
  const resultCount = $('#resultCount');
  const PAGE = 8;
  let filter = 'all';
  let sort = 'featured';
  let shown = PAGE;

  const TOPS = ['formal', 'casual', 'polos'];
  const matches = (p, f) => f === 'all' || (f === 'new' ? p.isNew : f === 'tops' ? TOPS.includes(p.cat) : p.cat === f);

  $$('[data-count-for]').forEach(el => {
    const n = PRODUCTS.filter(p => matches(p, el.dataset.countFor)).length;
    el.textContent = `${n} pieces`;
  });

  const sorted = list => {
    const l = [...list];
    if (sort === 'price-asc') l.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') l.sort((a, b) => b.price - a.price);
    else if (sort === 'name') l.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'new') l.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.rank - b.rank);
    else l.sort((a, b) => a.rank - b.rank);
    return l;
  };

  const cardHTML = (p, i) => {
    const tags = [];
    if (p.oldPrice) tags.push(`<span class="tag tag--sale">-${Math.round((1 - p.price / p.oldPrice) * 100)}%</span>`);
    if (p.isNew) tags.push('<span class="tag tag--new">New</span>');
    if (p.tag && p.tag !== 'New') tags.push(`<span class="tag">${esc(p.tag)}</span>`);
    return `<article class="card" style="--d:${(i % PAGE) * 0.05}s">
      <div class="card__media" data-open="${p.id}" data-cursor="View">
        <div class="card__tags">${tags.join('')}</div>
        <img src="${img(p.img, 700)}" alt="${esc(p.name)}" loading="lazy">
        <div class="card__actions">
          <button type="button" class="card__btn card__btn--quick" data-open="${p.id}">Quick view</button>
          <button type="button" class="card__btn card__btn--dark" data-add="${p.id}">Add to cart</button>
        </div>
      </div>
      <button type="button" class="card__wish" data-wish="${p.id}" aria-label="Add to wishlist" aria-pressed="false">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>
      </button>
      <div class="card__info">
        <div>
          <p class="card__cat">${esc(CATEGORIES[p.cat])}</p>
          <h3 class="card__name" data-open="${p.id}">${esc(p.name)}</h3>
        </div>
        <p class="price ${p.oldPrice ? 'price--sale' : ''}">${money(p.price)}${p.oldPrice ? `<s>${money(p.oldPrice)}</s>` : ''}</p>
      </div>
    </article>`;
  };

  const renderGrid = () => {
    const list = sorted(PRODUCTS.filter(p => matches(p, filter)));
    const visible = list.slice(0, shown);
    grid.innerHTML = visible.length ? visible.map(cardHTML).join('')
      : '<div class="empty"><h3>Nothing here yet</h3><p>New pieces are on their way — check back soon.</p></div>';
    resultCount.textContent = `Showing ${visible.length} of ${list.length} ${list.length === 1 ? 'piece' : 'pieces'}`;
    loadMore.parentElement.hidden = visible.length >= list.length;
    syncWishButtons();
  };

  function setFilter(f, scroll) {
    filter = f; shown = PAGE;
    $$('.chip[data-chip]').forEach(c => {
      const on = c.dataset.chip === f;
      c.classList.toggle('is-active', on);
      c.setAttribute('aria-selected', on);
      if (on) c.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    });
    renderGrid();
    if (scroll) $('#shop').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  $$('.chip[data-chip]').forEach(c => c.addEventListener('click', () => setFilter(c.dataset.chip)));
  $('#sortSelect').addEventListener('change', e => { sort = e.target.value; renderGrid(); });
  loadMore.addEventListener('click', () => { shown += PAGE; renderGrid(); });

  // Any link with data-filter jumps to the shop with that filter applied.
  document.addEventListener('click', e => {
    const link = e.target.closest('a[data-filter]');
    if (!link) return;
    e.preventDefault();
    closeMobileNav();
    header.classList.remove('is-open');
    setFilter(link.dataset.filter, true);
  });

  grid.addEventListener('click', e => {
    const add = e.target.closest('[data-add]');
    const w = e.target.closest('[data-wish]');
    const open = e.target.closest('[data-open]');
    if (add) { e.stopPropagation(); addToCart(add.dataset.add); }
    else if (w) toggleWish(w.dataset.wish);
    else if (open) openQuickView(open.dataset.open);
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

  /* ---------- Quick view ---------- */
  const qv = $('#quickView');
  const qvSizes = $('#qvSizes');
  const qvZoom = $('#qvZoom');
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
  $('#qvWish').addEventListener('click', () => toggleWish(qvProduct.id));

  qvZoom.addEventListener('mousemove', e => {
    const r = qvZoom.getBoundingClientRect();
    qvZoom.style.setProperty('--zx', `${((e.clientX - r.left) / r.width) * 100}%`);
    qvZoom.style.setProperty('--zy', `${((e.clientY - r.top) / r.height) * 100}%`);
  });
  qvZoom.addEventListener('mouseenter', () => qvZoom.classList.add('is-zoom'));
  qvZoom.addEventListener('mouseleave', () => qvZoom.classList.remove('is-zoom'));

  $$('[data-quick]').forEach(b => b.addEventListener('click', () => openQuickView(b.dataset.quick)));

  /* ---------- Size guide ---------- */
  const sgModal = $('#sizeGuide');
  const SIZE_DATA = {
    tops: { head: ['Size', 'Chest', 'Length', 'Shoulder', 'Sleeve'], rows: [
      ['XS', 36, 27.5, 16.5, 24], ['S', 38, 28, 17, 24.5], ['M', 40, 29, 17.75, 25],
      ['L', 42, 30, 18.5, 25.5], ['XL', 44, 31, 19.25, 26], ['XXL', 46, 32, 20, 26.5]] },
    bottoms: { head: ['Waist', 'Waist', 'Hip', 'Inseam', 'Leg opening'], rows: [
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
  $$('[data-size-guide]').forEach(b => b.addEventListener('click', () => {
    if (qvProduct && qv.classList.contains('is-open')) sgType = qvProduct.cat === 'bottoms' ? 'bottoms' : 'tops';
    renderSizeGuide(); openModal(sgModal);
  }));

  /* ---------- Checkout ---------- */
  const coModal = $('#checkout');
  $('#checkoutBtn').addEventListener('click', () => {
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
  });

  /* ---------- Search ---------- */
  const search = $('#search');
  const searchInput = $('#searchInput');
  const searchResults = $('#searchResults');

  const highlight = (text, q) => {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  };
  const runSearch = () => {
    const q = searchInput.value.trim().toLowerCase();
    const list = q
      ? PRODUCTS.filter(p => `${p.name} ${CATEGORIES[p.cat]} ${p.desc}`.toLowerCase().includes(q))
      : sorted(PRODUCTS).slice(0, 6);
    searchResults.innerHTML = list.length
      ? list.slice(0, 12).map(p => `<div class="sr" data-open="${p.id}" role="button" tabindex="0">
          <img src="${img(p.img, 400)}" alt="" loading="lazy"><p>${highlight(p.name, q)}</p><span>${money(p.price)}</span></div>`).join('')
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
  const openFromSearch = e => {
    const r = e.target.closest('[data-open]');
    if (!r) return;
    closeSearch(); openQuickView(r.dataset.open);
  };
  searchResults.addEventListener('click', openFromSearch);
  searchResults.addEventListener('keydown', e => { if (e.key === 'Enter') openFromSearch(e); });

  /* ---------- Lookbook ---------- */
  const track = $('#lookTrack');
  const lookProgress = $('#lookProgress');
  track.innerHTML = LOOKBOOK.map((l, i) => `<figure class="look">
      <div class="look__media"><img src="${img(l.img, 800)}" alt="Lookbook look ${i + 1}: ${esc(l.title)}" loading="lazy" draggable="false">
        <span class="look__num">${String(i + 1).padStart(2, '0')}</span></div>
      <figcaption class="look__foot"><span class="look__title">${esc(l.title)}</span>
        <button type="button" class="look__shop" data-open="${l.product}">Shop the look</button></figcaption>
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
    drag = { x: e.clientX, left: track.scrollLeft, moved: false };
  });
  window.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - drag.x;
    if (Math.abs(dx) > 4) { drag.moved = true; track.classList.add('is-dragging'); }
    track.scrollLeft = drag.left - dx;
  });
  window.addEventListener('pointerup', () => {
    if (!drag) return;
    drag = null;
    track.classList.remove('is-dragging');
  });
  track.addEventListener('click', e => {
    const b = e.target.closest('[data-open]');
    if (b) openQuickView(b.dataset.open);
  });

  /* ---------- Fragrance notes ---------- */
  $$('.notes__tab').forEach(tab => tab.addEventListener('click', () => {
    $$('.notes__tab').forEach(t => { const on = t === tab; t.classList.toggle('is-active', on); t.setAttribute('aria-selected', on); });
    $$('.notes__panel').forEach(p => p.classList.toggle('is-active', p.dataset.panel === tab.dataset.note));
  }));

  /* ---------- Forms ---------- */
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  $('#newsletterForm').addEventListener('submit', e => {
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

  $('#contactForm').addEventListener('submit', e => {
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
  renderGrid();
  syncBadges();
  renderDrawer();
  onScroll();
})();

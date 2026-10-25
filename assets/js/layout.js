/* Shared page chrome: header, navigation, footer and overlays.
   Rendered on every page so links and markup live in one place. */
(() => {
  'use strict';

  const page = document.body.dataset.page || 'home';
  const current = document.body.dataset.collection || '';
  const here = slug => (current === slug ? ' aria-current="page"' : '');

  const ICONS = {
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    heart: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z"/><path d="M9 8V7a3 3 0 0 1 6 0v1"/></svg>'
  };
  window.ICONS = ICONS;

  const logo = (extra = '') => `<span class="logo__prime">Prime</span><span class="logo__legacy">Legacy</span>${extra}`;

  // Only the home page gets the intro animation, once per browser session.
  let showPreloader = false;
  if (page === 'home') {
    try { showPreloader = !sessionStorage.getItem('pl_intro'); sessionStorage.setItem('pl_intro', '1'); } catch { showPreloader = false; }
  }

  const top = `
  <a class="skip-link" href="#main">Skip to content</a>
  ${showPreloader ? `<div class="preloader" aria-hidden="true">
    <div class="preloader__mark"><span class="preloader__word">Prime</span><span class="preloader__word preloader__word--italic">Legacy</span></div>
    <div class="preloader__bar"><span></span></div>
  </div>` : ''}

  <div class="announce" role="region" aria-label="Announcements">
    <div class="announce__track">
      <p class="announce__msg is-active">Complimentary shipping on orders above Rs. 5,000</p>
      <p class="announce__msg"><a href="winter-collection.html">The Winter Collection — now available</a></p>
      <p class="announce__msg">Hassle-free 7-day exchanges, nationwide</p>
    </div>
  </div>

  <header class="header" id="header">
    <div class="header__inner container">
      <button class="icon-btn header__burger" id="menuOpen" aria-label="Open menu" aria-controls="mobileNav" aria-expanded="false">
        <svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h12"/></svg>
      </button>

      <nav class="nav" aria-label="Primary">
        <ul class="nav__list">
          <li class="nav__item nav__item--mega">
            <a href="shop.html" class="nav__link"${here('shop')}>Shop</a>
            <div class="mega" role="region" aria-label="Shop menu">
              <div class="mega__inner container">
                <div class="mega__col">
                  <p class="mega__title"><a href="tops.html">Tops</a></p>
                  <a href="formal-shirts.html"${here('formal-shirts')}>Formal Shirts</a>
                  <a href="casual-shirts.html"${here('casual-shirts')}>Casual Shirts</a>
                  <a href="polos-tees.html"${here('polos-tees')}>Polos &amp; Tees</a>
                  <a href="tops.html"${here('tops')}>View all tops</a>
                </div>
                <div class="mega__col">
                  <p class="mega__title"><a href="bottoms.html">Bottoms</a></p>
                  <a href="bottoms.html"${here('bottoms')}>Tailored Trousers</a>
                  <a href="bottoms.html">Chinos</a>
                  <a href="bottoms.html">Denim</a>
                </div>
                <div class="mega__col">
                  <p class="mega__title">Collections</p>
                  <a href="new-arrivals.html"${here('new-arrivals')}>New Arrivals</a>
                  <a href="winter-collection.html"${here('winter-collection')}>The Winter Collection</a>
                  <a href="tailoring.html"${here('tailoring')}>Tailoring</a>
                  <a href="fragrance.html"${here('fragrance')}>Fragrance</a>
                  <a href="shop.html"${here('shop')}>Shop all</a>
                </div>
                <a href="winter-collection.html" class="mega__feature">
                  <img src="https://images.unsplash.com/photo-1559582798-678dfc71ccd8?auto=format&fit=crop&w=600&q=75" alt="Man in a camel overcoat walking with a leather bag" loading="lazy">
                  <span class="mega__feature-text">The Winter Edit <em>Shop now →</em></span>
                </a>
              </div>
            </div>
          </li>
          <li class="nav__item"><a href="new-arrivals.html" class="nav__link"${here('new-arrivals')}>New In</a></li>
          <li class="nav__item"><a href="winter-collection.html" class="nav__link"${here('winter-collection')}>Winter</a></li>
          <li class="nav__item"><a href="fragrance.html" class="nav__link"${here('fragrance')}>Fragrance</a></li>
        </ul>
      </nav>

      <a href="index.html" class="logo" aria-label="PrimeLegacy home">${logo()}</a>

      <div class="header__actions">
        <a href="index.html#story" class="nav__link header__text-link">Our Story</a>
        <a href="index.html#contact" class="nav__link header__text-link">Contact</a>
        <button class="icon-btn" id="searchOpen" aria-label="Search">${ICONS.search}</button>
        <button class="icon-btn" id="wishOpen" aria-label="Wishlist">${ICONS.heart}<span class="badge" data-wish-count hidden>0</span></button>
        <button class="icon-btn" id="cartOpen" aria-label="Cart">${ICONS.bag}<span class="badge" data-cart-count hidden>0</span></button>
      </div>
    </div>
  </header>

  <aside class="mobile-nav" id="mobileNav" aria-label="Mobile menu" aria-hidden="true">
    <div class="mobile-nav__head">
      <a href="index.html" class="logo logo--small">${logo()}</a>
      <button class="icon-btn" id="menuClose" aria-label="Close menu">${ICONS.close}</button>
    </div>
    <nav class="mobile-nav__links">
      <a href="index.html">Home</a>
      <a href="shop.html"${here('shop')}>Shop All</a>
      <a href="new-arrivals.html"${here('new-arrivals')}>New Arrivals</a>
      <a href="formal-shirts.html"${here('formal-shirts')}>Formal Shirts</a>
      <a href="casual-shirts.html"${here('casual-shirts')}>Casual Shirts</a>
      <a href="polos-tees.html"${here('polos-tees')}>Polos &amp; Tees</a>
      <a href="bottoms.html"${here('bottoms')}>Bottoms</a>
      <a href="winter-collection.html"${here('winter-collection')}>The Winter Collection</a>
      <a href="tailoring.html"${here('tailoring')}>Tailoring</a>
      <a href="fragrance.html"${here('fragrance')}>Fragrance</a>
      <a href="index.html#story">Our Story</a>
      <a href="index.html#contact">Contact</a>
    </nav>
    <div class="mobile-nav__foot"><p>Need help? <a href="index.html#contact">Get in touch</a></p></div>
  </aside>`;

  const bottom = `
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a href="index.html" class="logo logo--light">${logo()}</a>
          <p>Refined menswear and fragrance, crafted to last. Upgrade your wardrobe, embrace your individuality.</p>
        </div>
        <div class="footer__col">
          <h4>Shop</h4>
          <a href="new-arrivals.html">New Arrivals</a>
          <a href="tops.html">Shirts &amp; Polos</a>
          <a href="bottoms.html">Bottoms</a>
          <a href="winter-collection.html">Winter Collection</a>
          <a href="tailoring.html">Tailoring</a>
          <a href="fragrance.html">Fragrance</a>
        </div>
        <div class="footer__col">
          <h4>Help</h4>
          <a href="index.html#contact">Contact Us</a>
          <a href="index.html#contact">Shipping &amp; Delivery</a>
          <a href="index.html#contact">Exchanges</a>
          <button type="button" class="link-btn" data-size-guide>Size Guide</button>
        </div>
        <div class="footer__col">
          <h4>Company</h4>
          <a href="index.html#story">Our Story</a>
          <a href="index.html#lookbook">Lookbook</a>
          <a href="shop.html">Shop All</a>
        </div>
      </div>
      <div class="footer__big" aria-hidden="true">PrimeLegacy</div>
      <div class="footer__bottom">
        <p>&copy; <span data-year></span> PrimeLegacy. All rights reserved.</p>
        <p class="footer__pay"><span>Cash on Delivery</span><span>Bank Transfer</span><span>Nationwide Shipping</span></p>
      </div>
    </div>
  </footer>

  <div class="search" id="search" role="dialog" aria-modal="true" aria-label="Search products" aria-hidden="true">
    <div class="search__inner container">
      <div class="search__bar">
        ${ICONS.search}
        <label for="searchInput" class="visually-hidden">Search</label>
        <input id="searchInput" type="search" placeholder="Search shirts, trousers, fragrance…" autocomplete="off">
        <button class="icon-btn" id="searchClose" aria-label="Close search">${ICONS.close}</button>
      </div>
      <div class="search__suggest">
        <span>Popular:</span>
        <button data-term="polo">Polo</button>
        <button data-term="oud">Oud</button>
        <button data-term="trousers">Trousers</button>
        <button data-term="jacket">Jacket</button>
        <button data-term="formal">Formal</button>
      </div>
      <div class="search__results" id="searchResults" aria-live="polite"></div>
    </div>
  </div>

  <div class="overlay" id="overlay" hidden></div>
  <aside class="drawer" id="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle" aria-hidden="true">
    <div class="drawer__head">
      <div class="drawer__tabs">
        <button class="drawer__tab is-active" data-drawer-tab="cart" id="drawerTitle">Cart <span data-cart-count-inline>(0)</span></button>
        <button class="drawer__tab" data-drawer-tab="wish">Wishlist <span data-wish-count-inline>(0)</span></button>
      </div>
      <button class="icon-btn" id="drawerClose" aria-label="Close">${ICONS.close}</button>
    </div>
    <div class="drawer__ship" data-ship>
      <p data-ship-text></p>
      <div class="drawer__ship-bar"><span data-ship-bar></span></div>
    </div>
    <div class="drawer__body" id="drawerBody"></div>
    <div class="drawer__foot" id="drawerFoot">
      <div class="drawer__row"><span>Subtotal</span><strong data-subtotal>Rs. 0</strong></div>
      <p class="drawer__note">Shipping &amp; taxes calculated at checkout.</p>
      <button class="btn btn--dark btn--block" id="checkoutBtn">Checkout</button>
      <button class="btn btn--text btn--block" data-drawer-close>Continue shopping</button>
    </div>
  </aside>

  <div class="modal" id="quickView" role="dialog" aria-modal="true" aria-labelledby="qvTitle" aria-hidden="true">
    <div class="modal__dialog modal__dialog--wide">
      <button class="icon-btn modal__close" data-modal-close aria-label="Close">${ICONS.close}</button>
      <div class="qv">
        <div class="qv__media"><div class="qv__zoom" id="qvZoom"><img id="qvImg" alt=""></div></div>
        <div class="qv__info">
          <p class="eyebrow eyebrow--dark" id="qvCat"></p>
          <h3 class="qv__title" id="qvTitle"></h3>
          <p class="qv__price" id="qvPrice"></p>
          <p class="qv__desc" id="qvDesc"></p>
          <div class="qv__opt">
            <div class="qv__opt-head"><span id="qvOptLabel">Size</span><button type="button" class="link-btn" data-size-guide id="qvSizeGuide">Size guide</button></div>
            <div class="sizes" id="qvSizes" role="radiogroup" aria-label="Choose option"></div>
          </div>
          <div class="qv__actions">
            <div class="qty" aria-label="Quantity">
              <button type="button" data-qv-qty="-1" aria-label="Decrease quantity">−</button>
              <span id="qvQty">1</span>
              <button type="button" data-qv-qty="1" aria-label="Increase quantity">+</button>
            </div>
            <button class="btn btn--dark qv__add" id="qvAdd">Add to Cart</button>
            <button class="icon-btn icon-btn--outline qv__wish" id="qvWish" aria-label="Add to wishlist" aria-pressed="false">${ICONS.heart}</button>
          </div>
          <a class="qv__more" id="qvMore" href="#">View full details →</a>
          <ul class="qv__perks">
            <li>Free shipping over Rs. 5,000</li>
            <li>7-day hassle-free exchange</li>
            <li>Cash on delivery available</li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <div class="modal" id="sizeGuide" role="dialog" aria-modal="true" aria-labelledby="sgTitle" aria-hidden="true">
    <div class="modal__dialog">
      <button class="icon-btn modal__close" data-modal-close aria-label="Close">${ICONS.close}</button>
      <h3 class="modal__title" id="sgTitle">Size Guide</h3>
      <div class="sg__tabs" role="tablist">
        <button role="tab" class="chip is-active" data-sg="tops" aria-selected="true">Tops</button>
        <button role="tab" class="chip" data-sg="bottoms" aria-selected="false">Bottoms</button>
      </div>
      <div class="sg__unit">
        <span>Units:</span>
        <button class="link-btn is-active" data-unit="in">Inches</button>
        <button class="link-btn" data-unit="cm">CM</button>
      </div>
      <div class="table-wrap"><table class="sg__table" id="sgTable"></table></div>
      <p class="modal__note">Measurements are of the body, not the garment. Between sizes? Size up for a relaxed fit.</p>
    </div>
  </div>

  <div class="modal" id="checkout" role="dialog" aria-modal="true" aria-labelledby="coTitle" aria-hidden="true">
    <div class="modal__dialog">
      <button class="icon-btn modal__close" data-modal-close aria-label="Close">${ICONS.close}</button>
      <h3 class="modal__title" id="coTitle">Place your order</h3>
      <p class="modal__note">Online payments are coming soon. Send us your order and our team will confirm it with you directly — pay cash on delivery.</p>
      <div class="co__summary" id="coSummary"></div>
      <div class="co__actions">
        <a class="btn btn--dark btn--block" id="coWhatsapp" target="_blank" rel="noopener">Order via WhatsApp</a>
        <a class="btn btn--outline btn--block" id="coEmail">Order via Email</a>
      </div>
    </div>
  </div>

  <div class="toasts" id="toasts" aria-live="polite"></div>
  <button class="to-top" id="toTop" aria-label="Back to top">
    <svg class="to-top__ring" viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="22"/><circle cx="24" cy="24" r="22" class="to-top__progress"/></svg>
    <svg class="to-top__arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
  </button>`;

  document.body.insertAdjacentHTML('afterbegin', top);
  document.getElementById('main').insertAdjacentHTML('afterend', bottom);
  if (!showPreloader) document.body.classList.add('is-loaded');
})();

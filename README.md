# PrimeLegacy

A modern, interactive storefront for **PrimeLegacy** — refined menswear and fragrance.

Static site (HTML, CSS, vanilla JavaScript), no build step. Hosted on GitHub Pages.

## Features

- Animated preloader, hero slider with autoplay, swipe and progress indicators
- Mega menu, hide-on-scroll header, mobile drawer navigation
- Product grid with category filters, sorting and "load more"
- Quick view with size/volume selection, quantity and image zoom
- Cart and wishlist drawer saved in the browser (localStorage), with a free-shipping progress bar
- Checkout that sends the order summary via WhatsApp or email (cash on delivery)
- Live search overlay (press `/` to open)
- Draggable lookbook with "shop the look"
- Fragrance spotlight with interactive scent notes
- Size guide with inch/cm toggle, FAQ accordion, validated contact and newsletter forms
- Scroll reveal animations, parallax, custom cursor, back-to-top progress ring
- Responsive down to small phones; respects `prefers-reduced-motion`

## Editing

- **Contact details, WhatsApp number, free-shipping threshold:** `assets/js/products.js` → `window.STORE`
- **Products and lookbook:** `assets/js/products.js` → `window.PRODUCTS`, `window.LOOKBOOK`
  (`img` is an Unsplash photo id; replace with your own product photos when ready)
- **Styles:** `assets/css/style.css` (colour and font tokens at the top)

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python -m http.server 8000
```

Product photography: [Unsplash](https://unsplash.com) (placeholders).

# Lumi Noir — TODO

## P0 — Can't launch without these

- [ ] **Fix `site_content` table bug** — `AboutContent.tsx` and `admin/content/about/page.tsx` reference a `site_content` table that doesn't exist in `schema.sql`. Causes runtime crash.
- [ ] **Payment integration (Stripe)** — No payment provider installed. Checkout only saves orders to DB without collecting payment. Need Stripe setup, success/failure pages, and webhook handling.
- [ ] **Admin orders dashboard** — Orders are created in the DB but there's no UI to view or manage them. Need `/admin/orders` and `/admin/orders/:id` routes.
- [ ] **Legal pages** — Required for EU/Germany. Need: Impressum, Privacy Policy (Datenschutzerklärung), Terms & Conditions (AGB), Return Policy (Widerruf/Rückgabe).
- [ ] **Stock management** — No inventory tracking. Products can be ordered infinitely. Need stock quantity field, "out of stock" state, and quantity checks during order creation.

## P1 — Expected by customers at launch

- [ ] **Product variants (sizes/colors)** — No size or color selection on products. Essential for clothing. Need `product_variants` table, variant selection UI on product page, and variant-aware cart/checkout.
- [ ] **Order confirmation emails** — No email service installed. Need email provider (Resend, SendGrid, etc.) and order confirmation template.
- [ ] **Shipping cost calculation** — Checkout collects address but shows no shipping cost or delivery estimate. Need shipping rules (flat rate, free above X, region-based).
- [ ] **Search & filtering on shop page** — Shop page lists all products with no search, category filter, or price sort.
- [ ] **Contact page & FAQ** — Neither exists. Spec calls for email/WhatsApp/Instagram contact and FAQ for sizes, shipping, returns.

## P2 — Trust & growth

- [ ] **Cookie consent banner** — Required in the EU if using analytics or tracking. No consent UI exists.
- [ ] **SEO metadata & Open Graph tags** — Only generic site title. Need per-product `generateMetadata`, og:image/og:title for social sharing, sitemap.xml, robots.txt, and schema.org structured data.
- [ ] **Size guide** — Important for clothing to reduce returns. No size guide page or modal on product pages.
- [ ] **Image zoom / lightbox** — Product gallery has thumbnails and navigation but no zoom or fullscreen view.
- [ ] **User account & order history** — `/account` page is a placeholder. Need profile info display and past order list.

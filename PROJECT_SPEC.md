
# Lumi Noir — Online Abaya Shop (Project Spec)

> Goal: A mobile-first e-commerce website for selling abayas to Arab/Muslim women.  
> Tech: TypeScript/JavaScript frontend, Supabase backend, Render deployment.

---

## 1) Product Vision

### 1.1 What we’re building
- A responsive online shop (phone-first, also works well on desktop)
- Admin can add/manage products (photos, description, price, etc.)
- Users can browse products and purchase them

### 1.2 Target users
- Primary: mobile shoppers (most traffic)
- Secondary: desktop shoppers

### 1.3 Core success criteria (MVP)
- Admin can publish products in minutes
- Users can find products quickly on mobile
- Checkout works reliably end-to-end
- Order + customer info saved and visible to admin

---

## 2) MVP Scope

### 2.1 Admin features (MVP)
**Authentication**
- Admin login (restricted access)

**Product management**
- Create product:
  - Title / Name
  - Price (currency, e.g. EUR)
  - Description
  - Photos (multiple)
  - Category / collection (optional but useful)
  - Sizes (optional if relevant for abayas)
  - Colors (optional)
  - Stock status (in stock / out of stock)
- Update product
- Delete product
- Hide/unhide product (draft vs published)

**Orders**
- View orders list
- View order details:
  - Customer name
  - Email/phone
  - Address (if shipping)
  - Items + quantities
  - Total price
  - Payment status
  - Order status (new / paid / shipped / delivered / canceled)

### 2.2 User features (MVP)
**Storefront**
- Home page: featured/new products, collections
- Product list (grid)
- Product details page:
  - Photos gallery
  - Price
  - Description
  - Size/color selection (if used)
  - Add to cart
- Cart:
  - Quantity editing
  - Remove item
  - Subtotal + shipping estimate (optional)
- Checkout:
  - Customer info
  - Shipping address (if shipping)
  - Payment
  - Order confirmation page + email (optional)

---

## 3) “Shop Basics” Checklist (things people forget)

### 3.1 Payments
- Payment provider (Stripe is typical)
- Payment flow:
  - Success page
  - Cancel/failure handling
- Store currency + taxes rules (VAT?)
- Refund/cancellation rules

### 3.2 Shipping / delivery
- Where you ship (Germany only? EU? worldwide?)
- Shipping cost model:
  - Flat rate
  - Free above X
  - Depends on destination
- Shipping carrier integration (optional later)
- Order status workflow: paid → packed → shipped → delivered

### 3.3 Legal pages (important in Germany/EU)
- Impressum
- Datenschutzerklärung (privacy policy)
- AGB (terms)
- Widerruf / Rückgabe (return policy)
- Cookie consent (if you use analytics)

### 3.4 Customer support
- Contact page (email/WhatsApp/Instagram)
- FAQ (sizes, shipping time, returns)
- Order confirmation email (recommended)

### 3.5 Trust + UX
- Mobile-first performance (fast images)
- Clear product photos + zoom
- Size guide (if sizes exist)
- Clear return policy + shipping times
- Reviews (optional later)

---

## 4) Non-Functional Requirements

### 4.1 Responsive design
- Must be excellent on phone screens (primary)
- Desktop still polished
- Use mobile-first layout decisions

### 4.2 Performance
- Optimize images (lazy loading, thumbnails)
- Minimal JS on storefront
- Fast first load on mobile networks

### 4.3 Accessibility
- Readable text sizes
- Good contrast
- Keyboard navigation on desktop
- Alt text for images

### 4.4 Security
- Admin routes protected
- Supabase Row Level Security (RLS) enabled
- No public write access to products/orders without auth rules

---

## 5) Tech Stack (Current Plan)

### 5.1 Frontend
- JavaScript / TypeScript
- (Framework not specified yet — could be Next.js/React, etc.)
- Mobile-first UI components

### 5.2 Backend
- Supabase:
  - Auth
  - Postgres database
  - Storage for product images
  - Edge Functions (optional for payments/webhooks)

### 5.3 Deployment
- Render
- Environment variables management:
  - Supabase URL
  - Supabase anon key
  - Admin-only service role key (server-side only, never in client)

---

## 6) Data Model (Draft)

### 6.1 Tables
**products**
- id (uuid)
- title (text)
- description (text)
- price_cents (int) + currency (text)
- is_published (bool)
- created_at, updated_at
- category (text, optional)
- tags (text[], optional)

**product_images**
- id (uuid)
- product_id (fk)
- storage_path (text)
- sort_order (int)
- alt_text (text, optional)

**product_variants** (optional MVP; useful if sizes/colors)
- id (uuid)
- product_id (fk)
- size (text)
- color (text)
- sku (text, optional)
- stock_qty (int)

**carts** (optional if persistent carts)
- id (uuid)
- user_id (uuid nullable if guest)
- created_at

**cart_items**
- id (uuid)
- cart_id (fk)
- product_id (fk)
- variant_id (fk nullable)
- quantity (int)

**orders**
- id (uuid)
- user_id (uuid nullable if guest checkout)
- status (enum: new/paid/shipped/delivered/canceled)
- payment_status (enum: pending/paid/failed/refunded)
- total_cents (int)
- currency (text)
- customer_name (text)
- email (text)
- phone (text, optional)
- shipping_address_json (jsonb)
- created_at

**order_items**
- id (uuid)
- order_id (fk)
- product_id (fk)
- variant_id (fk nullable)
- title_snapshot (text)
- price_cents_snapshot (int)
- quantity (int)

### 6.2 Storage buckets (Supabase)
- `product-images/` (public read, admin write)
- Consider image transformation or pre-generated sizes

---

## 7) Pages / Routes (Draft)

### Public
- `/` Home
- `/shop` Product listing
- `/product/:id` Product details
- `/cart`
- `/checkout`
- `/order-success`
- `/order-cancel`

### Legal / Info
- `/contact`
- `/faq`
- `/impressum`
- `/privacy`
- `/terms`
- `/returns`

### Admin (protected)
- `/admin/login`
- `/admin/products`
- `/admin/products/new`
- `/admin/products/:id/edit`
- `/admin/orders`
- `/admin/orders/:id`

---

## 8) Purchase Flow (MVP)

1. User browses products
2. Adds item to cart
3. Goes to checkout, enters shipping + contact
4. Pays via payment provider
5. Payment webhook confirms payment
6. Create order in DB + set status “paid”
7. Admin sees order and fulfills

---

## 9) Analytics (Optional but common)
- Track:
  - product views
  - add-to-cart
  - checkout started
  - purchase completed
- Cookie consent needed if using analytics in EU

---

## 10) Future Enhancements (Post-MVP)
- User accounts + order history
- Wishlists
- Discount codes / coupons
- Reviews + ratings
- Multi-language (Arabic/English/German)
- Better search + filters (size/color/price)
- Email marketing integration
- Inventory management + low-stock alerts
- Instagram/TikTok shop linking

---

## 11) Open Decisions (fill later)
- Payment provider: Stripe?
- Shipping regions + costs?
- Guest checkout allowed?
- Variants needed now (sizes/colors) or later?
- Languages at launch?
- Brand style direction (colors, typography, photography vibe)?

---

## 12) Definition of Done (MVP)
- Admin can create/edit/publish products with multiple photos
- Mobile storefront is smooth and fast
- Cart + checkout works end-to-end
- Orders stored reliably + viewable in admin
- Legal pages exist (at least placeholders initially)
- Basic security (RLS, protected admin)

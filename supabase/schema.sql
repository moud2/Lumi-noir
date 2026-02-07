create extension if not exists "pgcrypto";

-- helper: is current user an admin?
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql stable
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

create policy "Admins can read their row"
on public.admins for select
to authenticated
using (user_id = auth.uid());


-- PRODUCTS
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  price_cents int not null check (price_cents >= 0),
  currency text not null default 'EUR',
  is_published boolean not null default false,
  cover_image_path text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_products_published_created
on public.products (is_published, created_at desc);

alter table public.products enable row level security;

create policy "Public read published products"
on public.products for select
using (is_published = true or public.is_admin());

create policy "Admin insert products"
on public.products for insert
to authenticated
with check (public.is_admin());

create policy "Admin update products"
on public.products for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "Admin delete products"
on public.products for delete
to authenticated
using (public.is_admin());


-- PRODUCT IMAGES
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  path text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_product_images_product_sort
on public.product_images (product_id, sort_order);

alter table public.product_images enable row level security;

create policy "Public read images (published products)"
on public.product_images for select
using (
  exists (
    select 1 from public.products p
    where p.id = product_id
      and (p.is_published = true or public.is_admin())
  )
);

create policy "Admin write images"
on public.product_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());


-- ORDERS (write only via server route using service role)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  email text not null,
  phone text,
  shipping_address jsonb not null,
  status text not null default 'new',
  total_cents int not null,
  currency text not null default 'EUR',
  created_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  title_snapshot text not null,
  price_cents_snapshot int not null,
  quantity int not null check (quantity > 0)
);

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Admin read orders"
on public.orders for select
to authenticated
using (public.is_admin());

create policy "Admin read order items"
on public.order_items for select
to authenticated
using (public.is_admin());


-- STORAGE POLICIES (create bucket 'product-images' in Supabase UI first)
create policy "Public read product images"
on storage.objects for select
using (bucket_id = 'product-images');

create policy "Admin upload product images"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin update product images"
on storage.objects for update
to authenticated
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admin delete product images"
on storage.objects for delete
to authenticated
using (bucket_id = 'product-images' and public.is_admin());


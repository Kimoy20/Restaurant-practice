-- Siaro Kaw – Restaurant Management (Supabase)
-- Run in Supabase SQL Editor

-- Users table for authentication
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password text not null,
  role text not null check (role in ('customer', 'owner')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Tables (for dine-in QR ordering + KDS)
create table if not exists public.tables (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price decimal(10,2) not null,
  image_url text,
  category text not null,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references public.tables(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'preparing', 'ready', 'served', 'cancelled')),
  notes text,
  customer_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  menu_item_id uuid not null references public.menu_items(id) on delete restrict,
  quantity int not null default 1 check (quantity > 0),
  notes text,
  created_at timestamptz not null default now()
);

-- Indexes for real-time and list performance
create index if not exists idx_users_email on public.users(email);
create index if not exists idx_orders_table_id on public.orders(table_id);
create index if not exists idx_orders_status_created on public.orders(status, created_at desc);
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- RLS: allow anonymous read for menu + tables; allow insert for orders (dine-in); kitchen can update
alter table public.users enable row level security;
alter table public.tables enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users are readable by everyone"
  on public.users for select using (true);

create policy "Anyone can create users"
  on public.users for insert with check (true);

create policy "Tables are readable by everyone"
  on public.tables for select using (true);

create policy "Menu is readable by everyone"
  on public.menu_items for select using (true);

create policy "Anyone can create orders (dine-in)"
  on public.orders for insert with check (true);

create policy "Anyone can read orders (for KDS / table display)"
  on public.orders for select using (true);

create policy "Orders can be updated (kitchen status)"
  on public.orders for update using (true);

create policy "Anyone can create order items"
  on public.order_items for insert with check (true);

create policy "Order items readable by everyone"
  on public.order_items for select using (true);

-- Realtime: broadcast changes on orders for KDS
alter publication supabase_realtime add table public.orders;

-- Seed: sample tables (slug used in QR: /order/table-1)
insert into public.tables (slug, name) values
  ('table-1', 'Table 1'),
  ('table-2', 'Table 2'),
  ('table-3', 'Table 3')
on conflict (slug) do nothing;

-- Seed: 5 items each in Pulutan, Main, Drinks (run once; clear menu_items first if re-seeding)
insert into public.menu_items (name, description, price, category, sort_order) values
  ('Kinilaw', 'Fresh tuna ceviche with coconut vinegar, ginger, and chili. A Siargao favorite.', 180, 'Pulutan', 1),
  ('Pork Sisig', 'Sizzling pork sisig with egg and calamansi. Crispy and tangy.', 200, 'Pulutan', 2),
  ('Chicharon Bulaklak', 'Crispy pork ruffle cracklings. Perfect with vinegar dip.', 150, 'Pulutan', 3),
  ('Crispy Pata', 'Deep-fried pork leg, tender inside and crispy outside. Served with soy-vinegar.', 380, 'Pulutan', 4),
  ('Bagnet', 'Crispy fried pork belly from the North. With bagoong and vinegar.', 280, 'Pulutan', 5),
  ('Grilled Tuna Belly', 'Inihaw na tuna belly with soy-calamansi dip. Tender and smoky.', 320, 'Main', 6),
  ('Chicken Inasal', 'Grilled chicken with annatto, served with garlic rice and atchara.', 220, 'Main', 7),
  ('Sinigang na Baboy', 'Sour tamarind pork soup with vegetables. Warm and comforting.', 200, 'Main', 8),
  ('Adobong Manok', 'Classic chicken adobo with soy, vinegar, and garlic. Savory and tender.', 190, 'Main', 9),
  ('Lechon Kawali', 'Crispy fried pork belly with lechon sauce. Rich and satisfying.', 280, 'Main', 10),
  ('Coconut Shake', 'Chilled fresh buko shake. Perfect island refreshment.', 120, 'Drinks', 11),
  ('Mango Shake', 'Sweet ripe mango shake. Tropical and refreshing.', 110, 'Drinks', 12),
  ('Calamansi Juice', 'Fresh calamansi with honey. Tangy and refreshing.', 80, 'Drinks', 13),
  ('Buko Juice', 'Young coconut water, fresh from the shell. Light and hydrating.', 100, 'Drinks', 14),
  ('Iced Coffee', 'Cold brew with condensed milk. Siargao style.', 130, 'Drinks', 15);
# Siaro Kaw — Restaurant Management (Siargao)

Island-style restaurant system: **dine-in QR ordering** and **real-time Kitchen Display (KDS)**. Built with React, Tailwind (teals, sandy beiges, wood), and Supabase.

## Features

- **Dine-in QR ordering** — Customers scan a table QR or open `/order/:tableSlug` to view the menu and place orders.
- **Kitchen Display (KDS)** — `/kitchen` shows live orders; new orders appear in real time via Supabase Realtime.
- **Siargao vibe** — Localized copy (e.g. **“Mangaon ta!”** for the order button, “Salamat!” after order).

## Tech Stack

- **Frontend:** React 18, React Router, Tailwind CSS (island palette: ocean teals, sand, wood).
- **Backend:** Supabase (Postgres, Auth optional, Realtime).

## Setup

1. **Clone and install**

   ```bash
   cd siaro-kaw
   npm install
   ```

2. **Supabase**

   - Create a project at [supabase.com](https://supabase.com).
   - In the SQL Editor, run the contents of `supabase/schema.sql`.
   - In Project Settings → API, copy the project URL and anon key.

3. **Env**

   ```bash
   cp .env.example .env
   ```

   Fill in:

   ```env
   VITE_SUPABASE_URL=https://xxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Run**

   ```bash
   npm run dev
   ```

   - **Table picker:** http://localhost:5173/table  
   - **Order (e.g. Table 1):** http://localhost:5173/order/table-1  
   - **Kitchen:** http://localhost:5173/kitchen  

Without env vars, the app runs with mock data so you can click through flows.

## QR Codes

Point each table’s QR to:

- `https://your-domain.com/order/table-1`
- `https://your-domain.com/order/table-2`
- etc. (slugs from the `tables` table).

## Localized copy

- **Mangaon ta!** — “Let’s eat!” (order / add to order).
- **Salamat!** — Thank you (after order sent).
- **Walay laman** — “Nothing in it” (empty cart).

## Supabase schema (summary)

- **tables** — `id`, `slug`, `name`, `is_active`
- **menu_items** — `id`, `name`, `description`, `price`, `image_url`, `category`, `is_available`, `sort_order`
- **orders** — `id`, `table_id`, `status` (pending → preparing → ready → served), `notes`, timestamps
- **order_items** — `order_id`, `menu_item_id`, `quantity`, `notes`

Realtime is enabled on `orders` so the kitchen view updates when new orders are inserted or status changes.
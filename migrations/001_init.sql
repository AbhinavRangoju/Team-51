-- MarketHub initial schema (mh_* namespace).
-- Statements are separated by -- @statement so the runner never splits on `;`.
-- Every statement is IF NOT EXISTS / idempotent.

CREATE TABLE IF NOT EXISTS mh_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)
-- @statement
CREATE TABLE IF NOT EXISTS mh_meta (
  key text PRIMARY KEY,
  value text NOT NULL
)
-- @statement
CREATE TABLE IF NOT EXISTS mh_users (
  id text PRIMARY KEY,
  email text NOT NULL UNIQUE,
  name text NOT NULL,
  phone text NULL,
  password_hash text NOT NULL,
  password_salt text NOT NULL,
  role text NOT NULL CHECK (role IN ('customer', 'vendor', 'admin')),
  status text NOT NULL CHECK (status IN ('Active', 'Suspended')),
  created_at text NOT NULL
)
-- @statement
CREATE TABLE IF NOT EXISTS mh_sessions (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES mh_users(id) ON DELETE CASCADE,
  expires_at bigint NOT NULL,
  created_at text NOT NULL
)
-- @statement
CREATE INDEX IF NOT EXISTS mh_sessions_user_id_idx ON mh_sessions (user_id)
-- @statement
CREATE INDEX IF NOT EXISTS mh_sessions_expires_at_idx ON mh_sessions (expires_at)
-- @statement
CREATE TABLE IF NOT EXISTS mh_vendors (
  id text PRIMARY KEY,
  user_id text NULL REFERENCES mh_users(id) ON DELETE SET NULL,
  name text NOT NULL,
  tagline text NOT NULL,
  city text NOT NULL,
  since integer NOT NULL,
  status text NOT NULL CHECK (status IN ('Verified', 'Pending Verification', 'Rejected')),
  verified boolean NOT NULL,
  rating double precision NOT NULL,
  created_at text NOT NULL
)
-- @statement
CREATE INDEX IF NOT EXISTS mh_vendors_user_id_idx ON mh_vendors (user_id)
-- @statement
CREATE TABLE IF NOT EXISTS mh_products (
  id text PRIMARY KEY,
  vendor_id text NOT NULL REFERENCES mh_vendors(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text NOT NULL,
  brand text NOT NULL,
  price_paise integer NOT NULL CHECK (price_paise >= 0),
  original_price_paise integer NULL CHECK (original_price_paise IS NULL OR original_price_paise >= 0),
  stock integer NOT NULL CHECK (stock >= 0),
  rating double precision NOT NULL,
  reviews integer NOT NULL,
  sku text NOT NULL,
  status text NOT NULL CHECK (status IN ('Active', 'Draft', 'Archived')),
  description text NOT NULL,
  specs jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at text NOT NULL
)
-- @statement
CREATE INDEX IF NOT EXISTS mh_products_vendor_id_idx ON mh_products (vendor_id)
-- @statement
CREATE TABLE IF NOT EXISTS mh_orders (
  id text PRIMARY KEY,
  user_id text NOT NULL REFERENCES mh_users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  subtotal_paise integer NOT NULL,
  discount_paise integer NOT NULL,
  delivery_paise integer NOT NULL,
  tax_paise integer NOT NULL,
  total_paise integer NOT NULL,
  status text NOT NULL CHECK (status IN (
    'Order Placed', 'Confirmed', 'Processing', 'Shipped',
    'Out for Delivery', 'Delivered', 'Cancelled'
  )),
  payment text NOT NULL CHECK (payment IN ('Paid', 'Pending', 'Refunded')),
  method text NOT NULL,
  eta text NOT NULL,
  ship_name text NOT NULL,
  ship_phone text NOT NULL,
  ship_line text NOT NULL,
  ship_city text NOT NULL,
  ship_pin text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at text NOT NULL
)
-- @statement
CREATE INDEX IF NOT EXISTS mh_orders_user_id_idx ON mh_orders (user_id)
-- @statement
CREATE INDEX IF NOT EXISTS mh_orders_created_at_idx ON mh_orders (created_at DESC)

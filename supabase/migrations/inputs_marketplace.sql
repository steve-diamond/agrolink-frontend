-- Input Products Table
CREATE TABLE IF NOT EXISTS input_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('seeds','fertiliser','agrochemical','equipment','other')),
  brand TEXT,
  description TEXT,
  price_per_unit NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  quantity_available INT NOT NULL,
  state TEXT NOT NULL,
  delivery_available BOOLEAN DEFAULT false,
  image_url TEXT,
  is_nafdac_approved BOOLEAN DEFAULT false,
  nafdac_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Input Orders Table
CREATE TABLE IF NOT EXISTS input_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  product_id uuid REFERENCES input_products(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  total_price NUMERIC NOT NULL,
  delivery_address TEXT,
  payment_status TEXT,
  order_status TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Counterfeit Reports Table
CREATE TABLE IF NOT EXISTS counterfeit_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES input_products(id) ON DELETE CASCADE,
  reporter_id uuid REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  evidence_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

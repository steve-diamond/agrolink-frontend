-- Migration: Create commodity_prices table
CREATE TABLE IF NOT EXISTS commodity_prices (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    commodity_name TEXT NOT NULL,
    price_per_kg NUMERIC NOT NULL,
    unit TEXT NOT NULL DEFAULT 'kg',
    state TEXT NOT NULL,
    lga TEXT,
    price_change_pct NUMERIC,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    trend TEXT CHECK (trend IN ('up', 'down', 'stable')) NOT NULL
);

-- Seed with 12 Nigerian commodities (2025 prices are illustrative)
INSERT INTO commodity_prices (commodity_name, price_per_kg, state, lga, price_change_pct, trend)
VALUES
  ('Maize', 420, 'Kano', 'Kumbotso', 2.5, 'up'),
  ('Cassava', 150, 'Ogun', 'Abeokuta South', -1.2, 'down'),
  ('Yam', 600, 'Benue', 'Gboko', 0.0, 'stable'),
  ('Plantain', 500, 'Ondo', 'Akure South', 1.8, 'up'),
  ('Tomato', 700, 'Kaduna', 'Zaria', -3.0, 'down'),
  ('Pepper', 650, 'Oyo', 'Ibadan North', 0.5, 'stable'),
  ('Rice (local)', 950, 'Kebbi', 'Birnin Kebbi', 2.0, 'up'),
  ('Soya Beans', 480, 'Nasarawa', 'Lafia', -0.8, 'down'),
  ('Palm Oil', 1200, 'Abia', 'Umuahia North', 1.0, 'up'),
  ('Catfish', 1800, 'Lagos', 'Alimosho', 0.0, 'stable'),
  ('Broiler Chicken', 1600, 'Ogun', 'Ado-Odo/Ota', 2.2, 'up'),
  ('Ugu (Pumpkin Leaf)', 350, 'Enugu', 'Enugu East', -1.5, 'down');

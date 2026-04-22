-- Cooperatives table
CREATE TABLE IF NOT EXISTS cooperatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cac_reg_number TEXT NOT NULL,
  state TEXT NOT NULL,
  lga TEXT NOT NULL,
  year_founded INT NOT NULL,
  primary_commodity TEXT NOT NULL,
  member_count INT,
  chairman_name TEXT NOT NULL,
  chairman_phone TEXT NOT NULL,
  chairman_email TEXT NOT NULL,
  secretary_name TEXT NOT NULL,
  secretary_phone TEXT NOT NULL,
  secretary_email TEXT NOT NULL,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Cooperative Members table
CREATE TABLE IF NOT EXISTS cooperative_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cooperative_id uuid REFERENCES cooperatives(id) ON DELETE CASCADE,
  farmer_id uuid REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('member', 'admin')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

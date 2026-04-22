-- Insurance Applications Table
CREATE TABLE IF NOT EXISTS insurance_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  plan TEXT NOT NULL CHECK (plan IN ('basic','standard','premium')),
  crop_type TEXT NOT NULL,
  farm_size_ha NUMERIC NOT NULL,
  state TEXT NOT NULL,
  lga TEXT,
  planting_date DATE NOT NULL,
  harvest_date DATE NOT NULL,
  premium_amount NUMERIC NOT NULL,
  coverage_amount NUMERIC NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','claimed','expired')),
  policy_number TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insurance Claims Table
CREATE TABLE IF NOT EXISTS insurance_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES insurance_applications(id) ON DELETE CASCADE,
  claim_reason TEXT NOT NULL,
  evidence_url TEXT,
  claimed_amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
);

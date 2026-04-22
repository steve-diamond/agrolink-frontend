-- Farm Campaigns Table
create table if not exists farm_campaigns (
  id uuid primary key default gen_random_uuid(),
  farmer_id uuid references profiles(id) not null,
  title text not null,
  description text not null,
  crop_type text not null,
  state text not null,
  farm_size_ha numeric not null,
  target_amount numeric not null,
  raised_amount numeric not null default 0,
  min_investment numeric not null,
  expected_return_pct numeric not null,
  duration_months integer not null,
  start_date date not null,
  harvest_date date not null,
  status text check (status in ('draft','active','funded','harvested','closed')) not null,
  cover_image_url text,
  created_at timestamptz default now()
);

-- Investments Table
create table if not exists investments (
  id uuid primary key default gen_random_uuid(),
  investor_id uuid references profiles(id) not null,
  campaign_id uuid references farm_campaigns(id) not null,
  amount_invested numeric not null,
  currency text check (currency in ('NGN','USD')) not null,
  expected_return numeric not null,
  actual_return numeric,
  investment_date timestamptz default now(),
  maturity_date timestamptz not null,
  status text check (status in ('active','matured','defaulted')) not null,
  payment_reference text not null
);

-- Investment Updates Table
create table if not exists investment_updates (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid references farm_campaigns(id) not null,
  title text not null,
  body text not null,
  photo_urls text[],
  created_at timestamptz default now()
);

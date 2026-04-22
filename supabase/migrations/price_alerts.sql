-- User Preferences for Price Alerts
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  commodity TEXT NOT NULL,
  state TEXT NOT NULL,
  alert_enabled BOOLEAN DEFAULT false,
  alert_threshold_pct NUMERIC DEFAULT 10,
  phone TEXT,
  UNIQUE(user_id, commodity, state)
);

-- Price Alert Log
CREATE TABLE IF NOT EXISTS price_alert_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  commodity TEXT NOT NULL,
  state TEXT NOT NULL,
  price NUMERIC,
  price_change_pct NUMERIC,
  alert_sent_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Grading system migration for produce_grades
CREATE TABLE IF NOT EXISTS produce_grades (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id uuid REFERENCES listings(id),
    farmer_id uuid REFERENCES farmers(id) NOT NULL,
    commodity text NOT NULL,
    grade text CHECK (grade IN ('A','B','C')) NOT NULL,
    criteria_met jsonb NOT NULL,
    photos text[] NOT NULL,
    grade_badge_url text NOT NULL,
    verified_by_agent boolean DEFAULT false,
    agent_id uuid REFERENCES agents(id),
    created_at timestamptz DEFAULT now()
);

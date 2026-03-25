-- ============================================================
-- MPL 2026 — Fixtures table
-- ============================================================
-- Stores tournament fixtures (matches) between two teams,
-- including schedule info, status, and result columns.
-- ============================================================

-- 1. Create the fixtures table
CREATE TABLE IF NOT EXISTS fixtures (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_number SERIAL,
  team_a_id TEXT NOT NULL REFERENCES teams(id),
  team_b_id TEXT NOT NULL REFERENCES teams(id),
  match_date TIMESTAMPTZ NOT NULL,
  venue TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed')),
  winning_team_id TEXT REFERENCES teams(id),
  mom_player_id UUID REFERENCES players(id),
  highest_scorer_id UUID REFERENCES players(id),
  highest_wicket_taker_id UUID REFERENCES players(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on fixtures
ALTER TABLE fixtures ENABLE ROW LEVEL SECURITY;

-- 3. All authenticated users can read fixtures
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read fixtures' AND tablename = 'fixtures') THEN
    CREATE POLICY "Authenticated users can read fixtures" ON fixtures FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- 4. Only admins can insert fixtures
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can insert fixtures' AND tablename = 'fixtures') THEN
    CREATE POLICY "Admins can insert fixtures" ON fixtures FOR INSERT TO authenticated
      WITH CHECK (((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin');
  END IF;
END $$;

-- 5. Only admins can update fixtures
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update fixtures' AND tablename = 'fixtures') THEN
    CREATE POLICY "Admins can update fixtures" ON fixtures FOR UPDATE TO authenticated
      USING (((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin');
  END IF;
END $$;

-- 6. Only admins can delete fixtures
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can delete fixtures' AND tablename = 'fixtures') THEN
    CREATE POLICY "Admins can delete fixtures" ON fixtures FOR DELETE TO authenticated
      USING (((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin');
  END IF;
END $$;

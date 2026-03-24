-- ============================================================
-- MPL 2026 — Match Settings table
-- ============================================================
-- Stores configurable match prediction settings:
-- prediction deadline offset and point values per category.
-- Seeded with a single default row.
-- ============================================================

-- 1. Create the match_settings table
CREATE TABLE IF NOT EXISTS match_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  prediction_deadline_minutes INTEGER NOT NULL DEFAULT 15,
  points_team_win INTEGER NOT NULL DEFAULT 10,
  points_mom INTEGER NOT NULL DEFAULT 15,
  points_highest_scorer INTEGER NOT NULL DEFAULT 15,
  points_highest_wicket_taker INTEGER NOT NULL DEFAULT 10,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on match_settings
ALTER TABLE match_settings ENABLE ROW LEVEL SECURITY;

-- 3. All authenticated users can read match settings
CREATE POLICY "Authenticated users can read match settings"
  ON match_settings FOR SELECT
  TO authenticated
  USING (true);

-- 4. Only admins can update match settings
CREATE POLICY "Admins can update match settings"
  ON match_settings FOR UPDATE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 5. Seed the default settings row
INSERT INTO match_settings (id, prediction_deadline_minutes, points_team_win, points_mom, points_highest_scorer, points_highest_wicket_taker)
VALUES ('default', 15, 10, 15, 15, 10);

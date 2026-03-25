-- ============================================================
-- MPL 2026 — Match Predictions table
-- ============================================================
-- Stores per-user match predictions for each fixture.
-- All prediction columns are nullable to allow partial submissions.
-- ============================================================

-- 1. Create the match_predictions table
CREATE TABLE IF NOT EXISTS match_predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  predicted_winner_id TEXT REFERENCES teams(id),
  predicted_mom_id UUID REFERENCES players(id),
  predicted_highest_scorer_id UUID REFERENCES players(id),
  predicted_highest_wicket_taker_id UUID REFERENCES players(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, fixture_id)
);

-- 2. Enable RLS on match_predictions
ALTER TABLE match_predictions ENABLE ROW LEVEL SECURITY;

-- 3. Users can read their own predictions
CREATE POLICY "Users can read own match predictions"
  ON match_predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 4. Users can insert their own predictions
CREATE POLICY "Users can insert own match predictions"
  ON match_predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 5. Users can update their own predictions
CREATE POLICY "Users can update own match predictions"
  ON match_predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Admins can read all predictions
CREATE POLICY "Admins can read all match predictions"
  ON match_predictions FOR SELECT
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

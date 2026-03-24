-- ============================================================
-- MPL 2026 — Auctions + Predictions tables
-- ============================================================

-- 1. Create the auctions table (one row per player auction)
CREATE TABLE IF NOT EXISTS auctions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL UNIQUE REFERENCES players(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'sold', 'unsold')),
  sold_price INTEGER,
  sold_to_team_id TEXT REFERENCES teams(id),
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable RLS on auctions
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;

-- 3. All authenticated users can read auctions
CREATE POLICY "Authenticated users can read auctions"
  ON auctions FOR SELECT
  TO authenticated
  USING (true);

-- 4. Only admins can insert auctions
CREATE POLICY "Admins can insert auctions"
  ON auctions FOR INSERT
  TO authenticated
  WITH CHECK (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 5. Only admins can update auctions
CREATE POLICY "Admins can update auctions"
  ON auctions FOR UPDATE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- ============================================================

-- 6. Create the predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  predicted_price INTEGER NOT NULL CHECK (predicted_price >= 0),
  predicted_team_id TEXT NOT NULL REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, player_id)
);

-- 7. Enable RLS on predictions
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- 8. Users can read their own predictions
CREATE POLICY "Users can read own predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 9. Users can insert their own predictions
CREATE POLICY "Users can insert own predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 10. Users can update their own predictions
CREATE POLICY "Users can update own predictions"
  ON predictions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 11. Admins can read all predictions
CREATE POLICY "Admins can read all predictions"
  ON predictions FOR SELECT
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

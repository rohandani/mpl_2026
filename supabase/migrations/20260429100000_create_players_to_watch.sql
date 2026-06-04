-- ============================================================
-- MPL 2026 — Players to Watch table
-- ============================================================
-- Allows admins to configure featured players for each fixture
-- to help users with their predictions
-- ============================================================

-- 1. Create the players_to_watch table
CREATE TABLE IF NOT EXISTS players_to_watch (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  fixture_id UUID NOT NULL REFERENCES fixtures(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  highlight_type TEXT NOT NULL CHECK (highlight_type IN ('form', 'record', 'key_player', 'injury_return', 'captaincy')),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(fixture_id, player_id)
);

-- 2. Enable RLS on players_to_watch
ALTER TABLE players_to_watch ENABLE ROW LEVEL SECURITY;

-- 3. All authenticated users can read players to watch
CREATE POLICY "Authenticated users can read players to watch"
  ON players_to_watch FOR SELECT
  TO authenticated
  USING (true);

-- 4. Only admins can insert players to watch
CREATE POLICY "Admins can insert players to watch"
  ON players_to_watch FOR INSERT
  TO authenticated
  WITH CHECK (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 5. Only admins can update players to watch
CREATE POLICY "Admins can update players to watch"
  ON players_to_watch FOR UPDATE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 6. Only admins can delete players to watch
CREATE POLICY "Admins can delete players to watch"
  ON players_to_watch FOR DELETE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 7. Add updated_at trigger
CREATE OR REPLACE FUNCTION update_players_to_watch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_players_to_watch_updated_at
  BEFORE UPDATE ON players_to_watch
  FOR EACH ROW
  EXECUTE FUNCTION update_players_to_watch_updated_at();
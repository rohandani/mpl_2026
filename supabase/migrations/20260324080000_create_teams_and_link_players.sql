-- ============================================================
-- MPL 2026 — Teams table + player-team relationship
-- ============================================================
-- Creates the teams table, seeds team data, adds team_id FK
-- to players, and assigns captains to their teams.
-- ============================================================

-- 1. Create the teams table
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  logo TEXT NOT NULL
);

-- 2. Enable RLS on teams
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- 3. All authenticated users can read teams
CREATE POLICY "Authenticated users can read teams"
  ON teams FOR SELECT
  TO authenticated
  USING (true);

-- 4. Seed team data
INSERT INTO teams (id, name, color, logo) VALUES
  ('lohagad-lions',         'Lohagad Lions',         '#E67E22', '/teams/lohagad-lions.png'),
  ('purandar-gladiators',   'Purandar Gladiators',   '#8E44AD', '/teams/purandar-gladiators.png'),
  ('raigad-rangers',        'Raigad Rangers',        '#2ECC71', '/teams/raigad-rangers.png'),
  ('shivneri-spartans',     'Shivneri Spartans',     '#E74C3C', '/teams/shivneri-spartans.png'),
  ('sindhudurg-stallions',  'Sindhudurg Stallions',  '#3498DB', '/teams/sindhudurg-stallions.png'),
  ('torna-titans',          'Torna Titans',          '#F1C40F', '/teams/torna-titans.png');

-- 5. Add team_id column to players (nullable — unassigned players have NULL)
ALTER TABLE players ADD COLUMN team_id TEXT REFERENCES teams(id) ON DELETE SET NULL;

-- 6. Assign captains to their teams
UPDATE players SET team_id = 'lohagad-lions'        WHERE name = 'Sanket'   AND is_captain = true;
UPDATE players SET team_id = 'sindhudurg-stallions'  WHERE name = 'Mahesh'   AND is_captain = true;
UPDATE players SET team_id = 'raigad-rangers'        WHERE name = 'Mayur'    AND is_captain = true;
UPDATE players SET team_id = 'shivneri-spartans'     WHERE name = 'Shailesh' AND is_captain = true;
UPDATE players SET team_id = 'purandar-gladiators'   WHERE name = 'Nikhil'   AND is_captain = true;
UPDATE players SET team_id = 'torna-titans'          WHERE name = 'Aditya'   AND is_captain = true;

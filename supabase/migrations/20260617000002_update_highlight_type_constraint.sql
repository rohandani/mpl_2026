-- ============================================================
-- MPL 2026 — Update highlight_type constraint in players_to_watch
-- ============================================================
-- Adds new highlight types for more player categorization options
-- ============================================================

-- Drop the existing check constraint
ALTER TABLE players_to_watch 
DROP CONSTRAINT IF EXISTS players_to_watch_highlight_type_check;

-- Add the new constraint with all highlight types
ALTER TABLE players_to_watch 
ADD CONSTRAINT players_to_watch_highlight_type_check 
CHECK (highlight_type IN (
  'form', 
  'record', 
  'key_player', 
  'injury_return', 
  'captaincy',
  'new_replacement',
  'buzzing_player',
  'milestone_chase',
  'underdog',
  'veteran_experience',
  'young_talent',
  'power_hitter',
  'death_bowler'
));
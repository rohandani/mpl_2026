-- ============================================================
-- MPL 2026 — Add stage field to fixtures
-- ============================================================
-- Adds a stage field to identify tournament phases
-- ============================================================

-- 1. Add stage column to fixtures table
ALTER TABLE fixtures ADD COLUMN stage TEXT DEFAULT 'Group Stage';

-- 2. Create check constraint for valid stages
ALTER TABLE fixtures ADD CONSTRAINT fixtures_stage_check 
CHECK (stage IN ('Group Stage', 'Quarter Final', 'Semi Final', 'Final', 'Third Place'));

-- 3. Update existing fixtures to have proper stages (example data)
-- This can be customized based on your tournament format
UPDATE fixtures SET stage = 'Group Stage' WHERE match_number <= 20;
UPDATE fixtures SET stage = 'Quarter Final' WHERE match_number BETWEEN 21 AND 24;
UPDATE fixtures SET stage = 'Semi Final' WHERE match_number BETWEEN 25 AND 26;
UPDATE fixtures SET stage = 'Third Place' WHERE match_number = 27;
UPDATE fixtures SET stage = 'Final' WHERE match_number = 28;
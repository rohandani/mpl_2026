-- ============================================================
-- MPL 2026 — Add show_historical_insights to match_settings
-- ============================================================
-- Allows admins to control visibility of historical insights section
-- ============================================================

ALTER TABLE match_settings
ADD COLUMN IF NOT EXISTS show_historical_insights BOOLEAN NOT NULL DEFAULT true;

-- Update existing row if it exists
UPDATE match_settings 
SET show_historical_insights = true 
WHERE id = 'default';
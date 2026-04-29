-- ============================================================
-- MPL 2026 — Add predictions_locked column to fixtures
-- ============================================================
-- Allows admins to manually lock predictions for a fixture,
-- independent of the time-based deadline.
-- ============================================================

ALTER TABLE fixtures
  ADD COLUMN IF NOT EXISTS predictions_locked BOOLEAN NOT NULL DEFAULT false;

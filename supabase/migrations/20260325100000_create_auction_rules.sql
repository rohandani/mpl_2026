-- ============================================================
-- MPL 2026 — Auction rules HTML on app_settings
-- ============================================================
-- Stores auction rules as HTML so admins can use bold, italic, etc.
-- ============================================================

ALTER TABLE app_settings
  ADD COLUMN IF NOT EXISTS auction_rules_html TEXT NOT NULL DEFAULT '<ul><li>Each captain starts with a purse of <b>$10,000 CAD</b></li><li>Each captain must pick <b>10 players</b> for their team</li></ul>';

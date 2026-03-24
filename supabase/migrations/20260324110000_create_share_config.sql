-- ============================================================
-- MPL 2026 — Share card configuration
-- ============================================================
-- Single-row config table for share card content.
-- Admins can update title and custom hashtags.
-- #MPL2026 and #PredictAndWin are always appended in code.
-- ============================================================

CREATE TABLE IF NOT EXISTS share_config (
  id TEXT PRIMARY KEY DEFAULT 'default',
  title TEXT NOT NULL DEFAULT 'Auction Predictions',
  hashtags TEXT[] NOT NULL DEFAULT ARRAY['#CricketAuction']::TEXT[],
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default row
INSERT INTO share_config (id, title, hashtags)
VALUES ('default', 'Auction Predictions', ARRAY['#CricketAuction'])
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE share_config ENABLE ROW LEVEL SECURITY;

-- Everyone can read
CREATE POLICY "Authenticated users can read share_config"
  ON share_config FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update share_config"
  ON share_config FOR UPDATE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

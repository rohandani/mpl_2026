-- ============================================================
-- MPL 2026 — App settings (prediction lock)
-- ============================================================
-- Single-row config table for global app settings.
-- Admins can toggle predictions_locked to freeze all predictions.
-- ============================================================

CREATE TABLE IF NOT EXISTS app_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  predictions_locked BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default row
INSERT INTO app_settings (id, predictions_locked)
VALUES ('default', false)
ON CONFLICT (id) DO NOTHING;

-- RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read (needed to check lock state)
CREATE POLICY "Authenticated users can read app_settings"
  ON app_settings FOR SELECT
  TO authenticated
  USING (true);

-- Only admins can update
CREATE POLICY "Admins can update app_settings"
  ON app_settings FOR UPDATE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

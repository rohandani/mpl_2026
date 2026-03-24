-- ============================================================
-- Seed captains for each team
-- ============================================================
-- Captains are pre-assigned and skip the auction.
-- Default role set to 'All-Rounder' — update as needed.
-- ============================================================

INSERT INTO players (name, role, base_price, is_captain) VALUES
  ('Sanket',   'All-Rounder', 200, true),
  ('Mahesh',   'All-Rounder', 200, true),
  ('Mayur',    'All-Rounder', 200, true),
  ('Shailesh', 'All-Rounder', 200, true),
  ('Nikhil',   'All-Rounder', 200, true),
  ('Aditya',   'All-Rounder', 200, true);

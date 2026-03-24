-- ============================================================
-- MPL 2026 — Players Table Migration
-- ============================================================
-- This SQL must be run in the Supabase SQL Editor (or via the
-- Supabase CLI with `supabase db push`). It creates the
-- `players` table and sets up Row Level Security policies.
-- ============================================================

-- 1. Create the players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Batsman', 'Bowler', 'All-Rounder', 'Wicket-Keeper')),
  base_price INTEGER NOT NULL DEFAULT 200,
  cricheroes_url TEXT,
  is_captain BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- 3. All authenticated users can read players
CREATE POLICY "Authenticated users can read players"
  ON players FOR SELECT
  TO authenticated
  USING (true);

-- 4. Only admins can insert players
CREATE POLICY "Admins can insert players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 5. Only admins can update players
CREATE POLICY "Admins can update players"
  ON players FOR UPDATE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

-- 6. Only admins can delete players
CREATE POLICY "Admins can delete players"
  ON players FOR DELETE
  TO authenticated
  USING (
    ((current_setting('request.jwt.claims', true)::json->'app_metadata')::json->>'role') = 'admin'
  );

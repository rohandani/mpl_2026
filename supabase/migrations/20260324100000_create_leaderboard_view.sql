-- ============================================================
-- MPL 2026 — Leaderboard RPC function
-- ============================================================
-- Computes scores for all users across settled auctions.
-- Runs as SECURITY DEFINER so it bypasses RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION get_leaderboard()
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  total_points NUMERIC,
  predictions_count BIGINT,
  correct_teams BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    p.user_id,
    COALESCE(
      u.raw_user_meta_data->>'full_name',
      u.email,
      'Anonymous'
    ) AS display_name,
    ROUND(SUM(
      -- Team points: 20 if correct
      CASE WHEN p.predicted_team_id = a.sold_to_team_id THEN 20 ELSE 0 END
      +
      -- Price points: max(0, 30 - (pct_off * 100)), capped at 30
      GREATEST(0, LEAST(30,
        30.0 - (ABS(p.predicted_price - a.sold_price)::NUMERIC / GREATEST(a.sold_price, 1)) * 100
      ))
    ), 1) AS total_points,
    COUNT(*) AS predictions_count,
    SUM(CASE WHEN p.predicted_team_id = a.sold_to_team_id THEN 1 ELSE 0 END) AS correct_teams
  FROM predictions p
  JOIN auctions a ON a.player_id = p.player_id AND a.sold_price IS NOT NULL
  JOIN auth.users u ON u.id = p.user_id
  GROUP BY p.user_id, u.raw_user_meta_data, u.email
  ORDER BY total_points DESC;
$$;

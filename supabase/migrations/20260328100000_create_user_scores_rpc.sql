-- ============================================================
-- MPL 2026 — User Scores RPC
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_scores(target_user_id UUID)
RETURNS TABLE (
  player_name TEXT,
  player_role TEXT,
  base_price INTEGER,
  predicted_price INTEGER,
  predicted_team_id TEXT,
  sold_price INTEGER,
  sold_to_team_id TEXT,
  team_points NUMERIC,
  price_points NUMERIC,
  total_points NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $fn$
  SELECT
    pl.name AS player_name,
    pl.role AS player_role,
    pl.base_price,
    p.predicted_price,
    p.predicted_team_id,
    a.sold_price,
    a.sold_to_team_id,
    CASE WHEN p.predicted_team_id = a.sold_to_team_id THEN 20 ELSE 0 END AS team_points,
    ROUND(GREATEST(0, LEAST(30,
      30.0 - (ABS(p.predicted_price - a.sold_price)::NUMERIC / GREATEST(a.sold_price, 1)) * 100
    )), 1) AS price_points,
    ROUND(
      CASE WHEN p.predicted_team_id = a.sold_to_team_id THEN 20 ELSE 0 END
      + GREATEST(0, LEAST(30,
        30.0 - (ABS(p.predicted_price - a.sold_price)::NUMERIC / GREATEST(a.sold_price, 1)) * 100
      ))
    , 1) AS total_points
  FROM predictions p
  JOIN players pl ON pl.id = p.player_id
  JOIN auctions a ON a.player_id = p.player_id AND a.sold_price IS NOT NULL
  WHERE p.user_id = target_user_id
  ORDER BY pl.name;
$fn$;
